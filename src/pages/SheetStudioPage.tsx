import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  isInsufficientCredits,
  useCharacters,
  useGenerateSheet,
  useGeneration,
  useGenerations,
} from '@sudobility/characterbuilder_client';
import {
  BODY_SHAPES,
  HAIR_FULLNESS,
  MUSCLE_LEVELS,
  type Generation,
  type SheetRequestInput,
} from '@sudobility/characterbuilder_types';
import { ImageTile } from '../components/ImageTile';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';
import {
  Badge,
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
  Spinner,
  Text,
  TextArea,
} from '../ui';

/**
 * The staged sheet studio: a headshot becomes an 8-direction head sheet, a
 * selected head becomes a body sheet (in underwear), and a selected body
 * becomes a clothed character sheet. Each stage conditions on the image you
 * SELECT from the previous one; selections are held here in memory and passed
 * as the next stage's source. Each stage polls its own async job.
 */
const NO_CHARACTER = '__none__';

export function SheetStudioPage() {
  const { characterId: routeCharId } = useParams();
  const { data: chars } = useCharacters();
  const [headImageId, setHeadImageId] = useState<string | null>(null);
  const [bodyImageId, setBodyImageId] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<string>(routeCharId ?? NO_CHARACTER);

  // Deep-linked from a character (/sheets/:characterId): preselect it and name
  // the breadcrumb after the character rather than the raw id.
  const charName = chars?.items.find((c) => c.id === routeCharId)?.name;
  useEffect(() => {
    if (routeCharId) setCharacterId(routeCharId);
  }, [routeCharId]);
  useEffect(() => {
    if (!routeCharId) return;
    const path = `/sheets/${routeCharId}`;
    const b = BreadcrumbBuilder.getInstance();
    b.setDynamicTitle(path, charName ?? 'Character');
    return () => b.clearDynamicTitle(path);
  }, [routeCharId, charName]);

  const ownerId = characterId === NO_CHARACTER ? undefined : characterId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Heading level={1} size="3xl" weight="bold">
          Character sheets
        </Heading>
        <Text as="p" color="muted" className="max-w-2xl">
          Build a character in three stages — head turnaround, body, then
          clothing. Pick the image you like at each stage; the next stage is
          built from it.
        </Text>
        <div className="flex flex-wrap items-center gap-3">
          <Stepper headImageId={headImageId} bodyImageId={bodyImageId} />
          <div className="flex items-center gap-2">
            <Label>For character</Label>
            <Select value={characterId} onValueChange={setCharacterId}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CHARACTER}>Not linked</SelectItem>
                {chars?.items.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <HeadStage
        characterId={ownerId}
        selectedId={headImageId}
        onSelect={(id) => {
          setHeadImageId(id);
          setBodyImageId(null); // a new head invalidates the chosen body
        }}
      />

      <BodyStage
        characterId={ownerId}
        sourceId={headImageId}
        selectedId={bodyImageId}
        onSelect={setBodyImageId}
      />

      <ClothedStage characterId={ownerId} sourceId={bodyImageId} />
    </div>
  );
}

/* ── Stage 1: head sheet ── */

function HeadStage({
  characterId,
  selectedId,
  onSelect,
}: {
  characterId?: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [upload, setUpload] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [hairFullness, setHairFullness] = useState('auto');
  const [marks, setMarks] = useState('');
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const stage = useStageJob();

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUpload(typeof reader.result === 'string' ? reader.result : null);
      setPickedId(null);
    };
    reader.readAsDataURL(file);
  };

  const hasSource = Boolean(upload || pickedId);
  const generate = () => {
    const req: SheetRequestInput = {
      kind: 'head-sheet',
      ...(characterId ? { characterId } : {}),
      ...(upload ? { referenceImage: upload } : { sourceImageId: pickedId! }),
      traits: {
        ...(hairFullness !== 'auto' ? { hairFullness: hairFullness as never } : {}),
        ...(marks.trim() ? { marksBehindHead: marks.trim() } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      },
    };
    stage.start(req);
  };

  return (
    <StageCard step={1} title="Head sheet" subtitle="A headshot → 8 head directions">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Start from a headshot</Label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f);
              }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              {upload ? 'Replace upload' : 'Upload image'}
            </Button>
            <Text as="span" size="sm" color="muted">
              or pick one of your generated images below
            </Text>
          </div>
          {upload && (
            <img
              src={upload}
              alt="uploaded headshot"
              className="h-28 w-28 rounded-lg object-cover"
            />
          )}
          <GalleryPicker
            selectedId={upload ? null : pickedId}
            onPick={(id) => {
              setPickedId(id);
              setUpload(null);
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StageSelect
            label="Hair fullness"
            value={hairFullness}
            options={HAIR_FULLNESS}
            onChange={setHairFullness}
          />
          <TextField label="Marks behind the head" value={marks} onChange={setMarks} />
          <TextField label="Other notes" value={note} onChange={setNote} />
        </div>

        <GenerateRow
          label="Generate head sheet"
          disabled={!hasSource}
          disabledHint="Upload or pick a headshot first"
          stage={stage}
          onGenerate={generate}
        />
        <StageResults stage={stage} selectedId={selectedId} onSelect={onSelect} />
      </div>
    </StageCard>
  );
}

/* ── Stage 2: body sheet ── */

function BodyStage({
  characterId,
  sourceId,
  selectedId,
  onSelect,
}: {
  characterId?: string;
  sourceId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bodyShape, setBodyShape] = useState('auto');
  const [muscle, setMuscle] = useState('auto');
  const [note, setNote] = useState('');
  const stage = useStageJob();

  const generate = () => {
    if (!sourceId) return;
    const req: SheetRequestInput = {
      kind: 'body-sheet',
      ...(characterId ? { characterId } : {}),
      sourceImageId: sourceId,
      body: {
        ...(heightCm ? { heightCm: Number(heightCm) } : {}),
        ...(weightKg ? { weightKg: Number(weightKg) } : {}),
        ...(bodyShape !== 'auto' ? { bodyShape: bodyShape as never } : {}),
        ...(muscle !== 'auto' ? { muscle: muscle as never } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      },
    };
    stage.start(req);
  };

  return (
    <StageCard
      step={2}
      title="Body sheet"
      subtitle="A selected head → full body (in underwear)"
      locked={!sourceId}
      lockedHint="Select a head above to continue"
    >
      <div className="flex flex-col gap-4">
        <SourcePreview label="Building from this head" imageId={sourceId} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumberField label="Height (cm)" value={heightCm} onChange={setHeightCm} />
          <NumberField label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
          <StageSelect label="Body shape" value={bodyShape} options={BODY_SHAPES} onChange={setBodyShape} />
          <StageSelect label="Muscle" value={muscle} options={MUSCLE_LEVELS} onChange={setMuscle} />
          <TextField label="Other notes" value={note} onChange={setNote} />
        </div>
        <GenerateRow
          label="Generate body sheet"
          disabled={!sourceId}
          stage={stage}
          onGenerate={generate}
        />
        <StageResults stage={stage} selectedId={selectedId} onSelect={onSelect} />
      </div>
    </StageCard>
  );
}

/* ── Stage 3: clothed sheet ── */

function ClothedStage({
  characterId,
  sourceId,
}: {
  characterId?: string;
  sourceId: string | null;
}) {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const stage = useStageJob();

  const generate = () => {
    if (!sourceId || !description.trim()) return;
    const req: SheetRequestInput = {
      kind: 'clothed-sheet',
      ...(characterId ? { characterId } : {}),
      sourceImageId: sourceId,
      wardrobe: {
        description: description.trim(),
        ...(style.trim() ? { style: style.trim() } : {}),
      },
    };
    stage.start(req);
  };

  return (
    <StageCard
      step={3}
      title="Clothed sheet"
      subtitle="A selected body → clothed character sheet"
      locked={!sourceId}
      lockedHint="Select a body above to continue"
    >
      <div className="flex flex-col gap-4">
        <SourcePreview label="Dressing this body" imageId={sourceId} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Wardrobe description</Label>
            <TextArea
              value={description}
              onChange={setDescription}
              placeholder="e.g. a charcoal three-piece suit with a burgundy tie and brogues"
              rows={3}
            />
          </div>
          <TextField label="Style (optional)" value={style} onChange={setStyle} />
        </div>
        <GenerateRow
          label="Generate clothed sheet"
          disabled={!sourceId || !description.trim()}
          disabledHint={!sourceId ? undefined : 'Describe the wardrobe first'}
          stage={stage}
          onGenerate={generate}
        />
        <StageResults stage={stage} />
      </div>
    </StageCard>
  );
}

/* ── Shared pieces ── */

interface StageJob {
  start: (req: SheetRequestInput) => void;
  job: Generation | undefined;
  error: string | null;
  active: boolean;
}

function useStageJob(): StageJob {
  const mutation = useGenerateSheet();
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: job } = useGeneration(jobId ?? undefined);

  const start = (req: SheetRequestInput) => {
    setError(null);
    setJobId(null);
    mutation.mutate(req, {
      onSuccess: (g) => setJobId(g.id),
      onError: (e) =>
        setError(
          isInsufficientCredits(e)
            ? `Not enough credits (need ${e.required}, have ${e.balance}).`
            : e instanceof Error
              ? e.message
              : 'Generation failed'
        ),
    });
  };

  const active = job
    ? job.status === 'pending' || job.status === 'running'
    : mutation.isPending;

  return { start, job, error, active };
}

function GenerateRow({
  label,
  disabled,
  disabledHint,
  stage,
  onGenerate,
}: {
  label: string;
  disabled?: boolean;
  disabledHint?: string;
  stage: StageJob;
  onGenerate?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="primary"
        disabled={disabled || stage.active}
        onClick={onGenerate}
        title={disabled ? disabledHint : undefined}
      >
        {stage.active ? 'Working…' : label}
      </Button>
      {disabled && disabledHint && (
        <Text as="span" size="sm" color="muted">
          {disabledHint}
        </Text>
      )}
      {stage.error && (
        <Text as="span" size="sm" className="text-red-500">
          {stage.error}
        </Text>
      )}
    </div>
  );
}

function StageResults({
  stage,
  selectedId,
  onSelect,
}: {
  stage: StageJob;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const job = stage.job;
  if (!job) return null;
  return (
    <div className="flex flex-col gap-2">
      {stage.active && (
        <Text as="p" size="sm" color="muted">
          {job.status === 'running' ? 'Rendering the sheet…' : 'Queued…'} This can take a while.
        </Text>
      )}
      {job.status === 'failed' && (
        <Text as="p" size="sm" className="text-red-500">
          {job.error ?? 'Generation failed'}
        </Text>
      )}
      {job.images.length > 0 && (
        <>
          {onSelect && (
            <Text as="p" size="sm" color="muted">
              Pick the one to carry to the next stage.
            </Text>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {job.images.map((img) => (
              <ImageTile
                key={img.id}
                imageId={img.id}
                alt={img.role ?? 'view'}
                label={img.role}
                selected={onSelect ? selectedId === img.id : undefined}
                onSelect={onSelect ? () => onSelect(img.id) : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** A grid of the user's existing generated images, selectable as a head source. */
function GalleryPicker({
  selectedId,
  onPick,
}: {
  selectedId: string | null;
  onPick: (id: string) => void;
}) {
  const { data } = useGenerations();
  const images = useMemo(
    () =>
      (data?.items ?? [])
        .flatMap((g) => g.images)
        .filter((img) => img.id)
        .slice(0, 12),
    [data]
  );
  if (images.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {images.map((img) => (
        <ImageTile
          key={img.id}
          imageId={img.id}
          alt="your image"
          selected={selectedId === img.id}
          onSelect={() => onPick(img.id)}
        />
      ))}
    </div>
  );
}

function SourcePreview({ label, imageId }: { label: string; imageId: string | null }) {
  if (!imageId) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24">
        <ImageTile imageId={imageId} alt="source" />
      </div>
      <Text as="span" size="sm" color="muted">
        {label}
      </Text>
    </div>
  );
}

function StageCard({
  step,
  title,
  subtitle,
  locked,
  lockedHint,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  locked?: boolean;
  lockedHint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant={locked ? 'default' : 'elevated'} padding="lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-theme-bg-secondary text-sm font-semibold text-theme-text-secondary">
            {step}
          </span>
          <Heading level={2} size="xl" weight="semibold">
            {title}
          </Heading>
          <Text as="span" size="sm" color="muted">
            {subtitle}
          </Text>
        </div>
      </CardHeader>
      <CardContent>
        {locked ? (
          <Text as="p" size="sm" color="muted">
            {lockedHint}
          </Text>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function StageSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o.replace(/-/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Stepper({
  headImageId,
  bodyImageId,
}: {
  headImageId: string | null;
  bodyImageId: string | null;
}) {
  const steps = [
    { n: 1, label: 'Head', done: Boolean(headImageId) },
    { n: 2, label: 'Body', done: Boolean(bodyImageId) },
    { n: 3, label: 'Clothed', done: false },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s) => (
        <Badge key={s.n} variant={s.done ? 'success' : 'default'} size="sm">
          {s.n}. {s.label}
          {s.done ? ' ✓' : ''}
        </Badge>
      ))}
    </div>
  );
}
