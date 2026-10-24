import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useAnalyze,
  useCharacter,
  useCreateCharacter,
  useDescribe,
  useGenerate,
  useGeneration,
  useUpdateCharacter,
} from '@sudobility/characterbuilder_client';
import {
  composePrompt,
  FEATURE_GROUPS,
  useDraft,
  useDraftStore,
} from '@sudobility/characterbuilder_lib';
import {
  EXPRESSIONS,
  HEALTH_STATES,
  IMAGE_SIZES,
  SHOTS,
  type Demographics,
  type FaceSpec,
} from '@sudobility/characterbuilder_types';
import { isInsufficientCredits } from '@sudobility/characterbuilder_client';
import { FaceSpecGroupCard } from '../components/FaceSpecForm';
import { AncestryPicker, pathLabel } from '../components/AncestryPicker';
import { ImageTile } from '../components/ImageTile';
import { GalleryPage } from './GalleryPage';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';
import { fileToDownscaledDataUrl } from '../lib/image';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Heading,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextArea,
} from '../ui';

const COUNTS = Array.from({ length: 10 }, (_, i) => String(i + 1));
// "Look" 1..10 → conformity 0.1..1.0: the fraction of unset traits cast to the
// most common ("beautiful") value for the demographic; the rest are sampled for
// variety. 'Any' = natural (no typicality bias). 10 = the most typical face.
const LOOK_NATURAL = 'Any';
const LOOK_OPTIONS = [LOOK_NATURAL, ...Array.from({ length: 10 }, (_, i) => String(i + 1))];
const lookValue = (conformity: number | undefined) =>
  conformity && conformity > 0 ? String(Math.round(conformity * 10)) : LOOK_NATURAL;
// 'auto' = let the caster decide (Radix Select forbids an empty-string value).
const HEALTH_OPTIONS = ['auto', ...HEALTH_STATES];

// The editor is a wizard: one step per section, in order. The first step is the
// free-text "describe", then every FEATURE_GROUP ("Who they are" first), then
// "Generate". You advance with Next; the tabs let you jump back to any step you
// have already reached, but never skip ahead.
const WIZARD_STEPS: { id: string; title: string }[] = [
  { id: 'describe', title: 'Describe the character' },
  ...FEATURE_GROUPS.map((g) => ({ id: g.id, title: g.title })),
  { id: 'generate', title: 'Generate' },
];
const LAST_STEP = WIZARD_STEPS.length - 1;

function ParamSelect(props: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{props.label}</Label>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useDraftStore();
  const { data: character } = useCharacter(id);

  const spec = useDraft((s) => s.spec);
  const params = useDraft((s) => s.params);
  const meta = useDraft((s) => s.meta);
  const characterId = useDraft((s) => s.characterId);

  // Name the `/characters/:id` breadcrumb with the character's name instead of
  // the raw id (the editor is the one place that knows it).
  const crumbName = character?.name ?? (meta.name.trim() || undefined);
  useEffect(() => {
    if (!id) return;
    const path = `/characters/${id}`;
    const builder = BreadcrumbBuilder.getInstance();
    builder.setDynamicTitle(path, crumbName ?? 'Character');
    return () => builder.clearDynamicTitle(path);
  }, [id, crumbName]);

  // Wizard position. `maxStep` is a high-water mark: tabs up to it are enabled,
  // so you can revisit anything you have seen but not jump ahead. Editing an
  // existing character unlocks every step (you are not creating from scratch).
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(id ? LAST_STEP : 0);
  useEffect(() => {
    if (id) setMaxStep(LAST_STEP);
  }, [id]);
  const goNext = () =>
    setStep((s) => {
      const n = Math.min(s + 1, LAST_STEP);
      setMaxStep((m) => Math.max(m, n));
      return n;
    });
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<string>('auto');
  // Hierarchical ancestry selection (node ids from the taxonomy root down). An empty
  // path = "any". `mix` adds a second heritage for a half-and-half person.
  const [ancestryPath, setAncestryPath] = useState<string[]>([]);
  const [mixEnabled, setMixEnabled] = useState<boolean>(false);
  const [ancestryPath2, setAncestryPath2] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [describeError, setDescribeError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const generate = useGenerate();
  const describe = useDescribe();
  const analyze = useAnalyze();
  const create = useCreateCharacter();
  const update = useUpdateCharacter();

  // Generation is an async job: poll the returned id until it finishes.
  const { data: job } = useGeneration(jobId ?? undefined);
  const jobActive =
    !!jobId && job?.status !== 'succeeded' && job?.status !== 'failed';

  // Sync the draft to the route: load a saved character, or reset for /new.
  useEffect(() => {
    if (id && character && store.getState().characterId !== id) {
      store.getState().load(character);
    }
    if (!id && store.getState().characterId !== null) {
      store.getState().reset();
    }
  }, [id, character, store]);

  const set = useCallback(
    (key: keyof FaceSpec, value: unknown) =>
      store.getState().setFeature(key, value as never),
    [store]
  );

  const count = Number(params.count ?? 1);
  const prompt = useMemo(() => composePrompt(spec, params), [spec, params]);

  /**
   * Persist the character (create or update) and return its id. New characters
   * get saved and the route is updated to `/characters/:id`, so the editor is
   * now editing a saved character. Default name "Untitled" when none is typed.
   */
  const saveCharacter = async (): Promise<string> => {
    const name = meta.name.trim() || 'Untitled';
    const cid = characterId ?? id;
    if (cid) {
      await update.mutateAsync({
        id: cid,
        req: { name, role: meta.role || null, notes: meta.notes || null, spec },
      });
      return cid;
    }
    const created = await create.mutateAsync({
      name,
      role: meta.role || undefined,
      notes: meta.notes || undefined,
      spec,
    });
    // Adopt the saved character as the draft, then reflect it in the URL.
    store.getState().load(created);
    navigate(`/characters/${created.id}`);
    return created.id;
  };

  // The demographics the Health / Sub-population controls describe (shared by
  // the generate flow and the describe-to-spec helper).
  const buildDemographics = (): Demographics => {
    const demographics: Demographics = {};
    if (health && health !== 'auto')
      demographics.health = health as Demographics['health'];
    const primary = pathLabel(ancestryPath);
    const secondary = pathLabel(ancestryPath2);
    if (mixEnabled && primary && secondary) {
      // Half-and-half: the caster resolves a concrete leaf on each side and
      // inherits every trait from one randomly-chosen parent.
      demographics.mix = [{ subPopulation: primary }, { subPopulation: secondary }];
    } else if (primary) {
      // A single heritage; a stem (e.g. "Asian") descends to a random sub-population.
      demographics.subPopulation = primary;
    }
    return demographics;
  };

  /**
   * Describe-to-spec: ask the AI to translate the free-text description into
   * structured traits, then merge them over the current draft (one undo step).
   */
  const onDescribe = async () => {
    const text = description.trim();
    if (!text || describe.isPending) return;
    setDescribeError(null);
    try {
      const { spec: inferred } = await describe.mutateAsync({
        description: text,
        ...(Object.keys(buildDemographics()).length > 0
          ? { demographics: buildDemographics() }
          : {}),
      });
      if (Object.keys(inferred).length === 0) {
        setDescribeError('No traits could be inferred from that description.');
        return;
      }
      store.getState().mergeSpec(inferred);
    } catch (e) {
      setDescribeError(
        e instanceof Error ? e.message : 'Could not read the description'
      );
    }
  };

  /**
   * Analyze-from-photo: downscale the chosen headshot, send it to the vision
   * endpoint, and merge the read traits over the draft (one undo step).
   */
  const onPhoto = async (file: File | undefined) => {
    if (!file || analyze.isPending) return;
    setPhotoError(null);
    try {
      const image = await fileToDownscaledDataUrl(file);
      const { spec: read } = await analyze.mutateAsync({
        image,
        ...(Object.keys(buildDemographics()).length > 0
          ? { demographics: buildDemographics() }
          : {}),
      });
      if (Object.keys(read).length === 0) {
        setPhotoError('No traits could be read from that photo.');
        return;
      }
      store.getState().mergeSpec(read);
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Could not read the photo');
    }
  };

  const onGenerate = async () => {
    setError(null);
    setJobId(null);
    const demographics = buildDemographics();

    // Auto-save first so every generation belongs to a saved character — the
    // user never has to save by hand before generating.
    let cid: string;
    try {
      cid = await saveCharacter();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the character');
      return;
    }

    generate.mutate(
      {
        spec,
        params,
        characterId: cid,
        ...(Object.keys(demographics).length > 0 ? { demographics } : {}),
      },
      {
        onSuccess: (g) => setJobId(g.id),
        onError: (e) =>
          setError(
            isInsufficientCredits(e)
              ? `Not enough credits (need ${e.required}, have ${e.balance}).`
              : e instanceof Error
                ? e.message
                : 'Generation failed'
          ),
      }
    );
  };

  // Surface a failed job's error.
  useEffect(() => {
    if (job?.status === 'failed') setError(job.error ?? 'Generation failed');
  }, [job?.status, job?.error]);

  const onSave = () => {
    const name = meta.name.trim() || 'Untitled';
    if (characterId) {
      update.mutate({
        id: characterId,
        req: { name, role: meta.role || null, notes: meta.notes || null, spec },
      });
    } else {
      create.mutate(
        { name, role: meta.role || undefined, notes: meta.notes || undefined, spec },
        { onSuccess: (c) => navigate(`/characters/${c.id}`) }
      );
    }
  };

  const stepId = WIZARD_STEPS[step]!.id;
  const group = FEATURE_GROUPS.find((g) => g.id === stepId);
  const generating =
    generate.isPending || jobActive || create.isPending || update.isPending;
  const genLabel =
    create.isPending || update.isPending
      ? 'Saving…'
      : generate.isPending
        ? 'Enqueuing…'
        : jobActive
          ? job?.status === 'running'
            ? 'Rendering…'
            : 'Queued…'
          : `Generate (${count} credit${count > 1 ? 's' : ''})`;

  // App-owned control injected under the "Who they are" group: the hierarchical
  // demographic picker (+ optional second heritage for a mixed person).
  const ancestryExtra = (
    <div className="flex flex-col gap-2 border-t border-theme-border pt-4">
      <AncestryPicker label="Demographic" path={ancestryPath} onChange={setAncestryPath} />
      <label className="flex items-center gap-2">
        <Checkbox checked={mixEnabled} onChange={setMixEnabled} />
        <Text as="span" size="sm">
          Mixed (blend two demographics)
        </Text>
      </label>
      {mixEnabled && (
        <AncestryPicker label="Mixed with" path={ancestryPath2} onChange={setAncestryPath2} />
      )}
      <Text as="p" size="xs" className="text-theme-text-secondary">
        Type to search, or pick a broad region — a region draws a random
        sub-population each image.
      </Text>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Persistent header: identity + global draft actions, on every step. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="cname">Name</Label>
          <Input
            id="cname"
            value={meta.name}
            placeholder="Character name"
            onChange={(e) => store.getState().setMeta({ name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="crole">Role</Label>
          <Input
            id="crole"
            value={meta.role}
            placeholder="e.g. lead"
            onChange={(e) => store.getState().setMeta({ role: e.target.value })}
          />
        </div>
        <Button variant="outline" onClick={() => store.getState().randomizeMissing()}>
          Randomize missing
        </Button>
        <Button variant="ghost" onClick={() => store.getState().undo()}>
          Undo
        </Button>
        <Button variant="ghost" onClick={() => store.getState().redo()}>
          Redo
        </Button>
        <Button
          variant="secondary"
          disabled={create.isPending || update.isPending}
          onClick={onSave}
        >
          {characterId ? 'Save' : 'Save as character'}
        </Button>
        {id && (
          <Link to={`/sheets/${id}`}>
            <Button variant="secondary">Character sheets</Button>
          </Link>
        )}
      </div>

      {/* Step tabs: enabled up to the furthest step reached; forward steps lock. */}
      <div className="flex flex-wrap gap-1 border-b border-theme-border pb-2">
        {WIZARD_STEPS.map((s, i) => (
          <Button
            key={s.id}
            size="sm"
            variant={i === step ? 'primary' : 'ghost'}
            disabled={i > maxStep}
            onClick={() => setStep(i)}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {/* Step body */}
      {stepId === 'describe' && (
        <Card>
          <CardHeader>
            <Heading level={3} size="lg">
              Describe the character
            </Heading>
            <Text as="p" size="sm" className="text-theme-text-secondary">
              Write a few sentences and let AI fill in the traits in the next
              steps. It only sets what the description implies — tweak the rest by
              hand. You can also skip straight ahead with Next.
            </Text>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <TextArea
                value={description}
                onChange={setDescription}
                rows={4}
                placeholder="e.g. A weathered fisherman in his 60s with deep-set grey eyes, a broad crooked nose, thick salt-and-pepper beard and sun-creased olive skin."
              />
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  disabled={!description.trim() || describe.isPending}
                  onClick={onDescribe}
                >
                  {describe.isPending ? 'Reading…' : 'Suggest traits'}
                </Button>
                {describeError && (
                  <Text as="span" size="sm" className="text-red-500">
                    {describeError}
                  </Text>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-theme-border pt-3">
                <Text as="span" size="sm" className="text-theme-text-secondary">
                  …or read the traits from a headshot:
                </Text>
                <label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                  {analyze.isPending ? 'Analyzing…' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={analyze.isPending}
                    onChange={(e) => {
                      onPhoto(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
                {photoError && (
                  <Text as="span" size="sm" className="text-red-500">
                    {photoError}
                  </Text>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {group && (
        <FaceSpecGroupCard
          group={group}
          spec={spec}
          set={set}
          extra={group.id === 'demographics' ? ancestryExtra : undefined}
        />
      )}

      {stepId === 'generate' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <Heading level={3} size="lg">
                Generate
              </Heading>
              <Text as="p" size="sm" className="text-theme-text-secondary">
                Choose the shot and press Generate below. Anything you left unset
                is cast coherently from the demographic you picked.
              </Text>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  <ParamSelect
                    label="Shot"
                    value={String(params.shot ?? 'headshot')}
                    options={SHOTS}
                    onChange={(v) => store.getState().setParams({ shot: v as never })}
                  />
                  <ParamSelect
                    label="Expression"
                    value={String(params.expression ?? 'neutral')}
                    options={EXPRESSIONS}
                    onChange={(v) =>
                      store.getState().setParams({ expression: v as never })
                    }
                  />
                  <ParamSelect
                    label="Size"
                    value={String(params.size ?? 'portrait')}
                    options={IMAGE_SIZES}
                    onChange={(v) => store.getState().setParams({ size: v as never })}
                  />
                  <ParamSelect
                    label="Count"
                    value={String(count)}
                    options={COUNTS}
                    onChange={(v) =>
                      store.getState().setParams({ count: Number(v) as never })
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <ParamSelect
                    label="Health"
                    value={health}
                    options={HEALTH_OPTIONS}
                    onChange={setHealth}
                  />
                  <ParamSelect
                    label="Look (1–10)"
                    value={lookValue(params.conformity)}
                    options={LOOK_OPTIONS}
                    onChange={(v) =>
                      store.getState().setParams({
                        conformity: (v === LOOK_NATURAL ? 0 : Number(v) / 10) as never,
                      })
                    }
                  />
                </div>

                <div className="rounded-lg bg-theme-bg-secondary p-3">
                  <Text as="span" size="xs" className="text-theme-text-secondary">
                    Prompt preview
                  </Text>
                  <Text as="p" size="sm" className="mt-1">
                    {prompt}
                  </Text>
                </div>

                {error && (
                  <Text as="p" size="sm" className="text-red-500">
                    {error}
                  </Text>
                )}
              </div>
            </CardContent>
          </Card>

          {jobId && (
            <Card>
              <CardHeader>
                <Heading level={3} size="lg">
                  Results
                </Heading>
              </CardHeader>
              <CardContent>
                {jobActive && (
                  <Text as="p" size="sm" className="text-theme-text-secondary">
                    {job?.status === 'running'
                      ? `Rendering ${count} image${count > 1 ? 's' : ''}…`
                      : 'Queued…'}{' '}
                    This can take a while.
                  </Text>
                )}
                {job && job.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {job.images.map((img) => (
                      <ImageTile key={img.id} imageId={img.id} alt={meta.name} />
                    ))}
                  </div>
                )}
                {job?.status === 'failed' && (
                  <Text as="p" size="sm" className="text-red-500">
                    {job.error ?? 'Generation failed'}
                  </Text>
                )}
              </CardContent>
            </Card>
          )}

          {/* This character's previously generated images. */}
          {id && <GalleryPage characterId={id} title="This character's images" />}
        </div>
      )}

      {/* Wizard footer: Back + the Next→Generate primary CTA. */}
      <div className="flex items-center justify-between border-t border-theme-border pt-4">
        <Button variant="ghost" disabled={step === 0} onClick={goBack}>
          Back
        </Button>
        {step === LAST_STEP ? (
          <Button variant="primary" disabled={generating} onClick={onGenerate}>
            {genLabel}
          </Button>
        ) : (
          <Button variant="primary" onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
