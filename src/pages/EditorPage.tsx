import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useAnalyze,
  useCharacter,
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
  visualStyleGroups,
  type Demographics,
  type FaceSpec,
} from '@sudobility/characterbuilder_types';
import { isInsufficientCredits } from '@sudobility/characterbuilder_client';
import { FaceSpecGroupCard } from '../components/FaceSpecForm';
import { AncestryPicker, pathLabel } from '../components/AncestryPicker';
import { ImageTile } from '../components/ImageTile';
import { GalleryPage } from './GalleryPage';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';
import { useSetPageConfig } from '../hooks/usePageConfig';
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
// "Art Style" and "Generate". You advance with Next; the tabs let you jump back to any step you
// have already reached, but never skip ahead.
const WIZARD_STEPS: { id: string; title: string }[] = [
  { id: 'describe', title: 'Describe the character' },
  ...FEATURE_GROUPS.map((g) => ({ id: g.id, title: g.title })),
  { id: 'art-style', title: 'Art Style' },
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

  // Own the full content height so the step content scrolls in its own pane while
  // the Back/Next bar stays pinned to the bottom of the content area (above the
  // footer). We re-add the centered column + horizontal padding ourselves.
  useSetPageConfig({
    layoutMode: 'full',
    maxWidth: 'full',
    contentPadding: 'none',
    scrollable: false,
  });

  // Name the `/characters/:id` breadcrumb with the character's name instead of
  // the raw id (the editor is the one place that knows it).
  const crumbName = character?.name ?? undefined;
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
  const [styleGroupId, setStyleGroupId] = useState(() =>
    visualStyleGroups.find((group) => group.styles.some((style) => style.id === params.artStyle))?.id
      ?? visualStyleGroups[0]!.id
  );

  const generate = useGenerate();
  const describe = useDescribe();
  const analyze = useAnalyze();
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
   * Leaving the describe step: if the user wrote a description, translate it to
   * structured traits and merge them over the draft (one undo step) BEFORE
   * advancing — so pressing Next does the "suggest traits" work automatically.
   * A failure (or empty text) is non-fatal: we still advance so the user can set
   * the traits by hand in the following steps.
   */
  const onNextFromDescribe = async () => {
    const text = description.trim();
    if (text && !describe.isPending) {
      setDescribeError(null);
      try {
        const { spec: inferred } = await describe.mutateAsync({
          description: text,
          ...(Object.keys(buildDemographics()).length > 0
            ? { demographics: buildDemographics() }
            : {}),
        });
        if (Object.keys(inferred).length > 0) store.getState().mergeSpec(inferred);
      } catch (e) {
        setDescribeError(
          e instanceof Error ? e.message : 'Could not read the description'
        );
      }
    }
    goNext();
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

    // No up-front naming: a fresh /advanced run generates from the spec alone and
    // the images are named afterward (on the portrait screen). When editing a
    // saved character, persist the spec edits and keep the run associated with it.
    const cid = characterId ?? id;
    if (cid) {
      try {
        await update.mutateAsync({ id: cid, req: { spec } });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save the character');
        return;
      }
    }

    generate.mutate(
      {
        spec,
        params,
        ...(cid ? { characterId: cid } : {}),
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

  const stepId = WIZARD_STEPS[step]!.id;
  const group = FEATURE_GROUPS.find((g) => g.id === stepId);
  const generating =
    generate.isPending || jobActive || update.isPending;
  const genLabel =
    update.isPending
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      {/* The trait options and controls scroll in their own pane; the Back/Next
          bar below stays pinned to the bottom of the content area. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
      {/* Persistent header: global draft actions, on every step. No name is asked
          here — images are named afterward on their portrait screen. */}
      <div className="flex flex-wrap items-end gap-3">
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
              Write a few sentences and we'll fill in the traits when you press
              Next — it only sets what the description implies, so you can tweak
              the rest by hand. Leave it blank to set everything yourself.
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
              {describeError && (
                <Text as="span" size="sm" className="text-red-500">
                  {describeError}
                </Text>
              )}

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

      {stepId === 'art-style' && (
        <section className="flex h-[min(65dvh,44rem)] min-h-[20rem] flex-col overflow-hidden rounded-lg border border-theme-border bg-theme-bg-primary">
          <div className="shrink-0 border-b border-theme-border p-4 sm:p-5">
            <Heading level={3} size="lg">Art Style</Heading>
            <Text as="p" size="sm" className="mt-1 text-theme-text-secondary">
              Choose the visual look for this character's portrait. Selected: {visualStyleGroups.flatMap((group) => group.styles).find((style) => style.id === (params.artStyle ?? 'naturalistic'))?.name ?? 'Naturalistic'}.
            </Text>
          </div>
          <div className="shrink-0 overflow-x-auto border-b border-theme-border p-3" role="group" aria-label="Art style groups">
            <div className="flex w-max gap-2">
              {visualStyleGroups.map((styleGroup) => (
                <button key={styleGroup.id} type="button" aria-pressed={styleGroupId === styleGroup.id}
                  className={`shrink-0 rounded border px-3 py-2 text-sm ${styleGroupId === styleGroup.id ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-theme-border'}`}
                  onClick={() => setStyleGroupId(styleGroup.id)}>{styleGroup.name}</button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5" aria-label="Art style choices">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visualStyleGroups.find((styleGroup) => styleGroup.id === styleGroupId)?.styles.map((style) => (
                <button key={style.id} type="button" aria-pressed={(params.artStyle ?? 'naturalistic') === style.id}
                  className={`overflow-hidden rounded-lg border-2 text-left ${(params.artStyle ?? 'naturalistic') === style.id ? 'border-blue-600' : 'border-theme-border'}`}
                  onClick={() => store.getState().setParams({ artStyle: style.id })}>
                  <img src={style.sampleImageUrl} alt={`${style.name} sample`} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                  <span className="block p-2"><strong className="block text-sm">{style.name}</strong><span className="block text-xs text-theme-text-secondary">{style.description}</span></span>
                </button>
              ))}
            </div>
          </div>
        </section>
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
              <Text as="p" size="sm" className="text-theme-text-secondary">
                Art style: {visualStyleGroups.flatMap((group) => group.styles).find((style) => style.id === (params.artStyle ?? 'naturalistic'))?.name ?? 'Naturalistic'}
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
                <Text as="p" size="sm" className="text-theme-text-secondary">
                  Look favors selected facial traits. Hair length, curl, density, and style stay varied at every Look level.
                </Text>

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
                  <>
                    <Text as="p" size="sm" className="mb-2 text-theme-text-secondary">
                      Tap an image to view it and keep it as a named character.
                    </Text>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {job.images.map((img) => (
                        <ImageTile
                          key={img.id}
                          imageId={img.id}
                          alt="generated portrait"
                          onClick={() =>
                            navigate(`/portrait/${img.id}`, { state: { spec: img.spec ?? spec } })
                          }
                        />
                      ))}
                    </div>
                  </>
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

        </div>
      </div>

      {/* Pinned action bar: always at the bottom of the content area, above the
          footer (never overlapping it). The step content scrolls in the pane above. */}
      <div className="flex-none border-t border-theme-border bg-theme-bg-primary shadow-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button variant="ghost" disabled={step === 0} onClick={goBack}>
            Back
          </Button>
          {step === LAST_STEP ? (
            <Button variant="primary" disabled={generating} onClick={onGenerate}>
              {genLabel}
            </Button>
          ) : stepId === 'describe' ? (
            // Leaving the describe step runs the AI trait-suggestion first.
            <Button
              variant="primary"
              disabled={describe.isPending}
              onClick={onNextFromDescribe}
            >
              {describe.isPending ? 'Reading…' : 'Next'}
            </Button>
          ) : (
            <Button variant="primary" onClick={goNext}>
              {stepId === 'art-style' ? 'Continue to Generate' : 'Next'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
