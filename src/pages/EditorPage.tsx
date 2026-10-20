import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useCharacter,
  useCreateCharacter,
  useGenerate,
  useGeneration,
  useUpdateCharacter,
} from '@sudobility/characterbuilder_client';
import {
  composePrompt,
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
import { FaceSpecForm } from '../components/FaceSpecForm';
import { ImageTile } from '../components/ImageTile';
import { GalleryPage } from './GalleryPage';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '../ui';

const COUNTS = Array.from({ length: 10 }, (_, i) => String(i + 1));
// 'auto' = let the caster decide (Radix Select forbids an empty-string value).
const HEALTH_OPTIONS = ['auto', ...HEALTH_STATES];

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

  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<string>('auto');
  const [subPopulation, setSubPopulation] = useState<string>('');

  const generate = useGenerate();
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

  const onGenerate = async () => {
    setError(null);
    setJobId(null);
    const demographics: Demographics = {};
    if (health && health !== 'auto')
      demographics.health = health as Demographics['health'];
    if (subPopulation.trim()) demographics.subPopulation = subPopulation.trim();

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

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: the comprehensive form */}
      <div className="flex flex-col gap-4">
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
          {id && (
            <Link to={`/sheets/${id}`}>
              <Button variant="secondary">Character sheets</Button>
            </Link>
          )}
        </div>
        <FaceSpecForm spec={spec} set={set} />
      </div>

      {/* Right: sticky generate panel */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <Heading level={3} size="lg">
              Generate
            </Heading>
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="subpop">Sub-population</Label>
                  <Input
                    id="subpop"
                    className="w-56"
                    value={subPopulation}
                    placeholder="e.g. Korean; Yoruba"
                    onChange={(e) => setSubPopulation(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-theme-bg-secondary p-3">
                <Text as="span" size="xs" className="text-theme-text-secondary">
                  Prompt preview
                </Text>
                <Text as="p" size="sm" className="mt-1">
                  {prompt}
                </Text>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  disabled={
                    generate.isPending ||
                    jobActive ||
                    create.isPending ||
                    update.isPending
                  }
                  onClick={onGenerate}
                >
                  {create.isPending || update.isPending
                    ? 'Saving…'
                    : generate.isPending
                      ? 'Enqueuing…'
                      : jobActive
                        ? job?.status === 'running'
                          ? 'Rendering…'
                          : 'Queued…'
                        : `Generate (${count} credit${count > 1 ? 's' : ''})`}
                </Button>
                <Button
                  variant="secondary"
                  disabled={create.isPending || update.isPending}
                  onClick={onSave}
                >
                  {characterId ? 'Save' : 'Save as character'}
                </Button>
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
                <div className="mt-2 grid grid-cols-2 gap-3">
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
      </div>
      </div>

      {/* The character's associated galleries (its generated images). */}
      {id && <GalleryPage characterId={id} title="This character's images" />}
    </div>
  );
}
