import { useState } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import {
  isInsufficientCredits,
  useAnalyze,
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

// When a photo is uploaded and "Create lookalike" is on, the photo is sent to the
// image model as a reference and this clause is appended to the prompt so the model
// keeps the person's identity while applying the traits the user described/changed.
const LOOKALIKE_CLAUSE =
  'Render the SAME person shown in the reference photo: keep their identity, face shape and bone structure. Apply the appearance described here, changing only the traits that differ from the photo (such as hairstyle, hair colour, facial hair, age or expression).';

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
  const { navigate } = useLocalizedNavigate();

  // Three screens: 'prompt' → 'essentials' → 'style'. Generate + results live on
  // the 'style' screen (the last step).
  const [step, setStep] = useState<'prompt' | 'essentials' | 'style'>('prompt');
  const [prompt, setPrompt] = useState('');
  // Traits read from the prompt (describe on Continue) and/or an uploaded photo.
  const [inferredSpec, setInferredSpec] = useState<FaceSpec>({});
  // An uploaded headshot (downscaled data URL) and whether to generate a lookalike
  // of it. With `lookalike` on, the photo is sent as a reference image so results
  // keep that person's identity, changing only the traits the prompt describes.
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [lookalike, setLookalike] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
  const analyze = useAnalyze();
  const generate = useGenerate();
  const { data: job } = useGeneration(jobId ?? undefined);
  const jobActive = !!jobId && job?.status !== 'succeeded' && job?.status !== 'failed';

  const busy = describe.isPending || generate.isPending || jobActive;

  const demographicsFrom = (): Demographics => {
    const demographics: Demographics = {};
    const primary = pathLabel(ancestryPath);
    if (primary) demographics.subPopulation = primary;
    return demographics;
  };

  // Reflect read traits (from the prompt or a photo) in the visible essentials, so
  // the user sees and can adjust what was inferred. Only overwrites a control when
  // the read traits actually name it; silence leaves it as the user left it.
  const prefillEssentials = (spec: FaceSpec) => {
    if (spec.sex) setSex(spec.sex);
    if (typeof spec.ageYears === 'number') setAge(String(spec.ageYears));
    else if (spec.ageBand && AGE_BAND_MID[spec.ageBand])
      setAge(String(AGE_BAND_MID[spec.ageBand]));
    const ethPath = pathForAncestry(spec.ancestry, spec.ancestryNote);
    if (ethPath.length > 0) setAncestryPath(ethPath);
  };

  // Read the traits visible in an uploaded headshot (vision), keep the photo for an
  // optional lookalike, and prefill the essentials. Keeping the photo even when no
  // traits are read lets the user still generate a lookalike from it.
  const onPhoto = async (file: File | undefined) => {
    if (!file || analyze.isPending) return;
    setPhotoError(null);
    try {
      const image = await fileToDownscaledDataUrl(file);
      setPhotoDataUrl(image);
      const { spec: read } = await analyze.mutateAsync({ image });
      if (Object.keys(read).length === 0) {
        setPhotoError('No traits could be read from that photo, but you can still create a lookalike.');
        return;
      }
      setInferredSpec((prev) => ({ ...prev, ...read }));
      prefillEssentials(read);
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Could not read the photo');
    }
  };

  const clearPhoto = () => {
    setPhotoDataUrl(null);
    setLookalike(false);
    setPhotoError(null);
  };

  // Leaving screen 1: read the traits the prompt implies (spinner on Continue),
  // then show the essentials. A failure is non-fatal — the raw prompt still drives
  // the image (it rides along in `description`) and the caster fills every unset
  // trait, so we advance either way.
  const onContinue = async () => {
    const text = prompt.trim();
    // Advance when there's a prompt and/or an uploaded photo to work from.
    if ((!text && !photoDataUrl) || describe.isPending) return;
    if (text) {
      let spec: FaceSpec = {};
      try {
        const res = await describe.mutateAsync({ description: text });
        spec = res.spec;
      } catch {
        spec = {};
      }
      // Merge the prompt's traits over anything a photo already read.
      setInferredSpec((prev) => ({ ...prev, ...spec }));
      // Reflect what the prompt said in the visible essentials (describe is
      // authoritative for the current text; silence leaves controls as-is).
      prefillEssentials(spec);
    }

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

    // Generate — the hidden traits are cast by the API; the prompt goes to the
    // image model too. No character is created up front: the user names the
    // images they want to keep afterward (on each image's portrait screen).
    const conformity = look === LOOK_ANY ? 0 : Number(look) / 10;
    // Lookalike: send the uploaded photo as a reference image and prepend the
    // identity-preserving clause so the result is the same person with the
    // described changes. Off → the photo was only used to read traits.
    const useLookalike = lookalike && !!photoDataUrl;
    const description = useLookalike ? `${LOOKALIKE_CLAUSE} ${text}`.trim() : text;
    generate.mutate(
      {
        spec,
        description,
        ...(useLookalike ? { referenceImage: photoDataUrl } : {}),
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
  const genLabel = generate.isPending
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

              <div className="flex flex-wrap items-center gap-3 border-t border-theme-border pt-3">
                <Text as="span" size="sm" className="text-theme-text-secondary">
                  …or read the traits from a headshot:
                </Text>
                <label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                  {analyze.isPending ? 'Analyzing…' : 'Upload Photo'}
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

              {photoDataUrl && (
                <div className="flex items-start gap-3 rounded-md border border-theme-border bg-theme-bg-secondary p-3">
                  <img
                    src={photoDataUrl}
                    alt="uploaded reference"
                    className="h-16 w-16 shrink-0 rounded object-cover"
                  />
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={lookalike} onChange={setLookalike} />
                      <Text as="span" size="sm" className="font-medium">
                        Create lookalike
                      </Text>
                    </label>
                    <Text as="p" size="xs" className="text-theme-text-secondary">
                      {lookalike
                        ? 'Generated images will look like this person, changing only the traits your prompt and essentials describe.'
                        : 'Off: the photo is only used to read traits — a brand-new face is generated.'}
                    </Text>
                    <button
                      type="button"
                      className="self-start text-xs text-theme-text-secondary underline"
                      onClick={clearPhoto}
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  disabled={(!prompt.trim() && !photoDataUrl) || describe.isPending || analyze.isPending}
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
                            navigate(`/portrait/${img.id}`, {
                              state: { spec: img.spec ?? inferredSpec },
                            })
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
    </div>
  );
}
