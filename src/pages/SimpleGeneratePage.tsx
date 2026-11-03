import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  isInsufficientCredits,
  useCreateCharacter,
  useDescribe,
  useGenerate,
  useGeneration,
} from '@sudobility/characterbuilder_client';
import {
  SEXES,
  visualStyleGroups,
  type Demographics,
  type FaceSpec,
} from '@sudobility/characterbuilder_types';
import { AncestryPicker, pathForAncestry, pathLabel } from '../components/AncestryPicker';
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
  TextArea,
} from '../ui';

// The simplified flow hides the 100+ traits. The user writes a prompt, we read
// the traits it implies (describe), ask a handful of essentials, and cast the
// rest. "Look" 1..10 → conformity (the fraction of unset traits drawn from
// good-looking odds); "Any" = natural. Default Look 7.
const LOOK_ANY = 'Any';
const LOOK_OPTIONS = [LOOK_ANY, ...Array.from({ length: 10 }, (_, i) => String(i + 1))];
const SEX_ANY = 'Any';
const SEX_OPTIONS = [SEX_ANY, ...SEXES];
const COUNTS = Array.from({ length: 10 }, (_, i) => String(i + 1));
const ART_STYLES = visualStyleGroups.flatMap((g) => g.styles);

// Representative age (years) per age band, so an "in his 60s" description that
// describe reads as `ageBand: 'sixties'` pre-fills the Age field with 65.
const AGE_BAND_MID: Record<string, number> = {
  child: 8,
  teen: 16,
  twenties: 25,
  thirties: 35,
  forties: 45,
  fifties: 55,
  sixties: 65,
  'seventies-plus': 75,
};

/** A short, friendly character name from the opening words of the prompt. */
function promptToName(prompt: string): string {
  const clean = prompt.trim().replace(/\s+/g, ' ');
  if (!clean) return 'Untitled';
  const cut = clean.slice(0, 40);
  return (cut.length < clean.length ? `${cut.replace(/[\s,.;:]+$/, '')}…` : cut) || 'Untitled';
}

function Field(props: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{props.label}</Label>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger className="w-full">
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

export function SimpleGeneratePage() {
  const navigate = useNavigate();

  // Three screens: 'prompt' → 'essentials' → 'style'. Generate + results live on
  // the 'style' screen (the last step).
  const [step, setStep] = useState<'prompt' | 'essentials' | 'style'>('prompt');
  const [prompt, setPrompt] = useState('');
  // Traits read from the prompt when leaving screen 1 (describe runs on Continue).
  const [inferredSpec, setInferredSpec] = useState<FaceSpec>({});

  // Essentials.
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<string>(SEX_ANY);
  const [ancestryPath, setAncestryPath] = useState<string[]>([]);
  const [look, setLook] = useState('7');
  const [artStyle, setArtStyle] = useState('naturalistic');
  const [styleGroupId, setStyleGroupId] = useState(
    () =>
      visualStyleGroups.find((g) => g.styles.some((s) => s.id === 'naturalistic'))?.id ??
      visualStyleGroups[0]!.id
  );
  const [count, setCount] = useState('1');

  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const describe = useDescribe();
  const create = useCreateCharacter();
  const generate = useGenerate();
  const { data: job } = useGeneration(jobId ?? undefined);
  const jobActive = !!jobId && job?.status !== 'succeeded' && job?.status !== 'failed';

  const busy =
    describe.isPending ||
    create.isPending ||
    generate.isPending ||
    jobActive;

  const demographicsFrom = (): Demographics => {
    const demographics: Demographics = {};
    const primary = pathLabel(ancestryPath);
    if (primary) demographics.subPopulation = primary;
    return demographics;
  };

  // Leaving screen 1: read the traits the prompt implies (spinner on Continue),
  // then show the essentials. A failure is non-fatal — the raw prompt still drives
  // the image (it rides along in `description`) and the caster fills every unset
  // trait, so we advance either way.
  const onContinue = async () => {
    const text = prompt.trim();
    if (!text || describe.isPending) return;
    let spec: FaceSpec = {};
    try {
      const res = await describe.mutateAsync({ description: text });
      spec = res.spec;
    } catch {
      spec = {};
    }
    setInferredSpec(spec);

    // Reflect what the prompt said in the visible essentials, so the user can see
    // (and adjust) the traits that were read — just like the advanced editor fills
    // its demographic controls. Describe is authoritative for the current prompt:
    // overwrite Age/Sex when the text implies them (so changing the prompt and
    // continuing again updates them), and leave them as-is when it doesn't.
    if (spec.sex) setSex(spec.sex);
    if (typeof spec.ageYears === 'number') setAge(String(spec.ageYears));
    else if (spec.ageBand && AGE_BAND_MID[spec.ageBand])
      setAge(String(AGE_BAND_MID[spec.ageBand]));
    // Ethnicity: map the inferred ancestry (+ sub-population note) onto the picker
    // path. This both shows it and feeds `demographics.subPopulation` at generate
    // time — the caster honors a named sub-population (e.g. "Chinese"), whereas the
    // broad `spec.ancestry` alone only picks a RANDOM East-Asian leaf.
    const ethPath = pathForAncestry(spec.ancestry, spec.ancestryNote);
    if (ethPath.length > 0) setAncestryPath(ethPath);

    setStep('essentials');
  };

  const onGenerate = async () => {
    setError(null);
    setJobId(null);
    const demographics = demographicsFrom();
    const text = prompt.trim();

    // Start from the traits read on Continue; the essentials the user set
    // explicitly win over anything describe inferred.
    const spec: FaceSpec = { ...inferredSpec };
    if (sex !== SEX_ANY) spec.sex = sex as FaceSpec['sex'];
    const ageYears = Number(age);
    if (age.trim() && Number.isFinite(ageYears) && ageYears >= 1 && ageYears <= 120)
      spec.ageYears = Math.round(ageYears);

    // Auto-save a character so the images land in the gallery/history.
    let characterId: string;
    try {
      const character = await create.mutateAsync({ name: promptToName(text), spec });
      characterId = character.id;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the character');
      return;
    }

    // Generate — the hidden traits are cast by the API; the prompt goes to the
    // image model too.
    const conformity = look === LOOK_ANY ? 0 : Number(look) / 10;
    generate.mutate(
      {
        spec,
        characterId,
        description: text,
        ...(Object.keys(demographics).length > 0 ? { demographics } : {}),
        params: {
          count: Number(count),
          size: 'portrait',
          shot: 'headshot',
          expression: 'neutral',
          artStyle: artStyle as never,
          conformity,
        },
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

  const n = Number(count);
  const genLabel = create.isPending
    ? 'Saving…'
    : generate.isPending
      ? 'Enqueuing…'
      : jobActive
        ? job?.status === 'running'
          ? 'Rendering…'
          : 'Queued…'
        : `Generate (${n} credit${n > 1 ? 's' : ''})`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1">
        <Heading level={1} size="2xl">
          Create a character
        </Heading>
        <Text as="p" size="sm" className="text-theme-text-secondary">
          Describe who you want in your own words. We'll read the details, ask a
          couple of essentials, and generate — everything else is filled in for you.
        </Text>
      </div>

      {step === 'prompt' && (
        <Card>
          <CardHeader>
            <Heading level={2} size="lg">
              Describe your character
            </Heading>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <TextArea
                value={prompt}
                onChange={setPrompt}
                rows={5}
                placeholder="e.g. A weathered fisherman in his 60s with deep-set grey eyes, a broad crooked nose, a thick salt-and-pepper beard and sun-creased olive skin, looking out to sea."
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  disabled={!prompt.trim() || describe.isPending}
                  onClick={onContinue}
                >
                  {describe.isPending ? 'Reading prompt…' : 'Continue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'essentials' && (
        <Card>
          <CardHeader>
            <Heading level={2} size="lg">
              A few essentials
            </Heading>
            <Text as="p" size="sm" className="text-theme-text-secondary">
              Only what matters most — the rest of the face is generated to match
              your description.
            </Text>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    className="h-9"
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    placeholder="Any"
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <Field label="Sex" value={sex} options={SEX_OPTIONS} onChange={setSex} />
                <Field label="Look (1–10)" value={look} options={LOOK_OPTIONS} onChange={setLook} />
                <Field label="Number of images" value={count} options={COUNTS} onChange={setCount} />
                <div className="sm:col-span-2">
                  <AncestryPicker label="Ethnicity" path={ancestryPath} onChange={setAncestryPath} />
                  <Text as="p" size="xs" className="mt-1 text-theme-text-secondary">
                    Optional. Pick a broad region and we'll draw a sub-population, or
                    leave it to match your description.
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep('prompt')}>
                  Back
                </Button>
                <Button variant="primary" onClick={() => setStep('style')}>
                  Next: art style
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'style' && (
        <>
          <section className="flex flex-col gap-4 rounded-lg border border-theme-border bg-theme-bg-primary p-4 sm:p-5">
            <div>
              <Heading level={2} size="lg">
                Art style
              </Heading>
              <Text as="p" size="sm" className="mt-1 text-theme-text-secondary">
                Choose the visual look. Selected:{' '}
                {ART_STYLES.find((s) => s.id === artStyle)?.name ?? 'Naturalistic'}.
              </Text>
            </div>
            <div className="overflow-x-auto" role="group" aria-label="Art style groups">
              <div className="flex w-max gap-2">
                {visualStyleGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={styleGroupId === g.id}
                    className={`shrink-0 rounded border px-3 py-2 text-sm ${styleGroupId === g.id ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-theme-border'}`}
                    onClick={() => setStyleGroupId(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visualStyleGroups
                .find((g) => g.id === styleGroupId)
                ?.styles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    aria-pressed={artStyle === style.id}
                    className={`overflow-hidden rounded-lg border-2 text-left ${artStyle === style.id ? 'border-blue-600' : 'border-theme-border'}`}
                    onClick={() => setArtStyle(style.id)}
                  >
                    <img
                      src={style.sampleImageUrl}
                      alt={`${style.name} sample`}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <span className="block p-2">
                      <strong className="block text-sm">{style.name}</strong>
                      <span className="block text-xs text-theme-text-secondary">
                        {style.description}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </section>

          {error && (
            <Text as="p" size="sm" className="text-red-500">
              {error}
            </Text>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" disabled={busy} onClick={() => setStep('essentials')}>
              Back
            </Button>
            <Button variant="primary" disabled={busy} onClick={onGenerate}>
              {genLabel}
            </Button>
          </div>

          {jobId && (
            <Card>
              <CardHeader>
                <Heading level={2} size="lg">
                  Results
                </Heading>
              </CardHeader>
              <CardContent>
                {jobActive && (
                  <Text as="p" size="sm" className="text-theme-text-secondary">
                    {job?.status === 'running'
                      ? `Rendering ${n} image${n > 1 ? 's' : ''}…`
                      : 'Queued…'}{' '}
                    This can take a while.
                  </Text>
                )}
                {job && job.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {job.images.map((img) => (
                      <ImageTile key={img.id} imageId={img.id} alt={promptToName(prompt)} />
                    ))}
                  </div>
                )}
                {job?.status === 'failed' && (
                  <Text as="p" size="sm" className="text-red-500">
                    {job.error ?? 'Generation failed'}
                  </Text>
                )}
                {job?.status === 'succeeded' && (
                  <div className="mt-3">
                    <Button variant="secondary" onClick={() => navigate('/dashboard/gallery')}>
                      View in gallery
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Text as="p" size="sm" className="text-center text-theme-text-secondary">
        Need full control over every trait?{' '}
        <Link to="/advanced" className="underline">
          Open the advanced editor
        </Link>
        .
      </Text>
    </div>
  );
}
