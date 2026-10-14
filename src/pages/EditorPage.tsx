import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCharacter,
  useCreateCharacter,
  useGenerate,
  useUpdateCharacter,
} from '@sudobility/characterbuilder_client';
import {
  composePrompt,
  useDraft,
  useDraftStore,
} from '@sudobility/characterbuilder_lib';
import {
  EXPRESSIONS,
  IMAGE_SIZES,
  SHOTS,
  type FaceSpec,
  type Generation,
} from '@sudobility/characterbuilder_types';
import { isInsufficientCredits } from '@sudobility/characterbuilder_client';
import { FaceSpecForm } from '../components/FaceSpecForm';
import { ImageTile } from '../components/ImageTile';
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

const COUNTS = ['1', '2', '3', '4'];

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

  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useGenerate();
  const create = useCreateCharacter();
  const update = useUpdateCharacter();

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

  const onGenerate = () => {
    setError(null);
    generate.mutate(
      { spec, params },
      {
        onSuccess: (g) => setResult(g),
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
                  disabled={generate.isPending}
                  onClick={onGenerate}
                >
                  {generate.isPending
                    ? 'Generating…'
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

        {result && result.images.length > 0 && (
          <Card>
            <CardHeader>
              <Heading level={3} size="lg">
                Results
              </Heading>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {result.images.map((img) => (
                  <ImageTile key={img.id} imageId={img.id} alt={meta.name} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
