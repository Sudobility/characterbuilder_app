import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  isInsufficientCredits,
  useCharacterBuilderClient,
  useGenerate,
  useGeneration,
} from '@sudobility/characterbuilder_client';
import { FACE_FEATURE_VALUES, type FaceSpec } from '@sudobility/characterbuilder_types';
import { ImageTile } from './ImageTile';
import { blobToDownscaledDataUrl } from '../lib/image';
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

// Only traits a person can plausibly change without surgery — aging, grooming,
// makeup, tanning, a dye job. Bone structure (nose, eyes, jaw, face shape) is
// identity and is NOT offered, so a variation stays the same person.
const MUTABLE_ENUM_FIELDS: { key: keyof typeof FACE_FEATURE_VALUES; label: string }[] = [
  { key: 'hairLength', label: 'Hair length' },
  { key: 'hairStyle', label: 'Hair style' },
  { key: 'hairTexture', label: 'Hair texture (curl)' },
  { key: 'hairColor', label: 'Hair color' },
  { key: 'hairDensity', label: 'Hair thickness' },
  { key: 'greying', label: 'Greying' },
  { key: 'facialHair', label: 'Facial hair' },
  { key: 'facialHairDensity', label: 'Facial hair density' },
  { key: 'skinTone', label: 'Skin tone' },
  { key: 'build', label: 'Build' },
];

const COUNTS = ['1', '2', '3', '4'];

// Up to this many years of age change, we still pass the original photo as a
// reference (likeness stays locked). Beyond it, the reference is dropped so the
// age can actually move (the face then comes from the shared trait spec).
const AGE_REFERENCE_MAX_DELTA = 8;

function titleCase(v: string): string {
  return v.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Generate variations of an EXISTING headshot: the mutable facial features are
 * pre-filled from the image's own spec; the user changes one or more and we
 * generate a NEW headshot from the same base spec, conditioned on the original
 * image (passed as a reference) so it stays the same person. The new images are
 * assigned to the character (characterId) — i.e. they become more headshots of it.
 */
export function VariationPanel({
  sourceImageId,
  characterId,
  baseSpec,
}: {
  sourceImageId: string;
  characterId: string;
  baseSpec: FaceSpec;
}) {
  const client = useCharacterBuilderClient();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Draft overrides, seeded from the source headshot's own values.
  const [age, setAge] = useState(
    typeof baseSpec.ageYears === 'number' ? String(baseSpec.ageYears) : ''
  );
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const { key } of MUTABLE_ENUM_FIELDS) {
      const v = baseSpec[key];
      if (typeof v === 'string') init[key] = v;
    }
    return init;
  });
  const [count, setCount] = useState('1');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [imageNote, setImageNote] = useState('');
  const [noteEdited, setNoteEdited] = useState(false);
  const suggestedNote = (() => {
    const parts: string[] = [];
    const targetAge = age.trim() ? Math.round(Number(age)) : NaN;
    if (Number.isFinite(targetAge) && targetAge >= 1 && targetAge <= 120 &&
        targetAge !== baseSpec.ageYears) {
      parts.push('At ' + targetAge + ' years old');
    }
    for (const { key, label } of MUTABLE_ENUM_FIELDS) {
      const value = fields[key];
      if (!value || value === baseSpec[key]) continue;
      if (key === 'hairLength') parts.push(titleCase(value) + ' hair');
      else if (key === 'build') parts.push(titleCase(value) + ' build');
      else parts.push(titleCase(value) + ' ' + label.toLowerCase());
    }
    return parts.join(', ');
  })();
  useEffect(() => {
    if (!noteEdited) setImageNote(suggestedNote);
  }, [suggestedNote, noteEdited]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useGenerate();
  const { data: job } = useGeneration(jobId ?? undefined);
  const jobActive = !!jobId && job?.status !== 'succeeded' && job?.status !== 'failed';
  const busy = generate.isPending || jobActive;

  // Preview the reference trade-off: a large age change drops the photo reference.
  const bigAgeJump = (() => {
    const orig = typeof baseSpec.ageYears === 'number' ? baseSpec.ageYears : undefined;
    const t = age.trim() && Number.isFinite(Number(age)) ? Math.round(Number(age)) : undefined;
    return orig != null && t != null && Math.abs(t - orig) > AGE_REFERENCE_MAX_DELTA;
  })();

  const n = Number(count);
  const genLabel = generate.isPending
    ? 'Enqueuing…'
    : jobActive
      ? job?.status === 'running'
        ? 'Rendering…'
        : 'Queued…'
      : `Generate ${n} variation${n > 1 ? 's' : ''} (${n} credit${n > 1 ? 's' : ''})`;

  const onGenerate = async () => {
    setError(null);
    setJobId(null);

    // Start from the source image's full spec (so everything else is held fixed)
    // and apply the user's mutable-trait changes on top.
    const spec: FaceSpec = { ...baseSpec };
    const originalAge =
      typeof baseSpec.ageYears === 'number' ? baseSpec.ageYears : undefined;
    const parsedAge = Number(age);
    const targetAge =
      age.trim() && Number.isFinite(parsedAge)
        ? Math.min(120, Math.max(1, Math.round(parsedAge)))
        : undefined;
    if (targetAge != null) spec.ageYears = targetAge;
    for (const { key } of MUTABLE_ENUM_FIELDS) {
      const v = fields[key];
      if (v) (spec as Record<string, unknown>)[key] = v;
    }

    const ageDelta =
      targetAge != null && originalAge != null
        ? Math.abs(targetAge - originalAge)
        : 0;
    // The reference photo anchors the ORIGINAL age, so a large age change fights
    // it. Keep the reference for small tweaks (locks likeness); drop it for a big
    // jump so the age can actually move — identity then rides on the shared spec.
    const useReference = ageDelta <= AGE_REFERENCE_MAX_DELTA;

    let referenceImage: string | undefined;
    if (useReference) {
      try {
        const blob = await client.getImageBytes(sourceImageId);
        referenceImage = await blobToDownscaledDataUrl(blob);
      } catch {
        referenceImage = undefined; // best-effort; spec still drives the face
      }
    }

    // Tell the model the direction of an age change (older vs. younger), relative
    // to the original — otherwise a reference-conditioned render has no cue which
    // way to age. Appended verbatim to the composed prompt.
    let description: string | undefined;
    if (targetAge != null && originalAge != null && targetAge !== originalAge) {
      const dir = targetAge > originalAge ? 'older' : 'younger';
      description = useReference
        ? `This is the same person shown in the reference image, where they are about ${originalAge} years old. Re-render them ${dir}, at ${targetAge} years old, keeping their identity and bone structure; age the face naturally (skin, wrinkles, hair).`
        : `A naturalistic portrait of the same person at ${targetAge} years old (${dir} than their original age of ${originalAge}). Keep their identity and facial bone structure; only age-appropriate changes to skin and hair.`;
    }

    const combinedDescription = [description, additionalPrompt.trim()]
      .filter(Boolean).join(' ');

    generate.mutate(
      {
        spec,
        characterId,
        ...(referenceImage ? { referenceImage } : {}),
        ...(combinedDescription ? { description: combinedDescription } : {}),
        ...(imageNote.trim() ? { imageNote: imageNote.trim() } : {}),
        params: {
          count: n,
          size: 'portrait',
          shot: 'headshot',
          expression: 'neutral',
          artStyle: 'naturalistic',
          conformity: 0,
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

  // When a run finishes, refresh the character's headshot grid.
  const succeeded = job?.status === 'succeeded';
  useEffect(() => {
    if (succeeded) {
      qc.invalidateQueries({
        queryKey: ['characterbuilder', 'character', characterId, 'images'],
      });
    }
  }, [succeeded, characterId, qc]);

  return (
    <Card>
      <CardHeader>
        <Heading level={2} size="lg">
          Generate variations
        </Heading>
        <Text as="p" size="sm" className="text-theme-text-secondary">
          Change what a person can change — age, build, hair, grooming, skin tone — and
          we'll make a new headshot of the same face. Bone structure stays fixed.
        </Text>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="var-age">Age (years)</Label>
              <Input
                id="var-age"
                className="h-9"
                type="number"
                min={1}
                max={120}
                value={age}
                placeholder="Keep"
                onChange={(e) => setAge(e.target.value)}
              />
              {bigAgeJump && (
                <Text as="span" size="xs" className="text-theme-text-secondary">
                  Large age change — generated from the traits (not pinned to the
                  original photo) so the age can move.
                </Text>
              )}
            </div>
            {MUTABLE_ENUM_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <Label>{label}</Label>
                <Select
                  value={fields[key] ?? ''}
                  onValueChange={(v) => setFields((f) => ({ ...f, [key]: v }))}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Keep" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACE_FEATURE_VALUES[key].map((o) => (
                      <SelectItem key={o} value={o}>
                        {titleCase(o)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <Label>Number of images</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="var-note">Image note</Label>
            <Input
              id="var-note"
              value={imageNote}
              maxLength={400}
              placeholder="What changed in this variation"
              onChange={(e) => { setNoteEdited(true); setImageNote(e.target.value); }}
            />
            <Text as="span" size="xs" className="text-theme-text-secondary">
              Suggested from the changed traits; you can edit it.
            </Text>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Additional Prompt</Label>
            <TextArea
              value={additionalPrompt}
              onChange={setAdditionalPrompt}
              placeholder="Extra details for the image generator"
            />
          </div>

          {error && (
            <Text as="p" size="sm" className="text-red-500">
              {error}
            </Text>
          )}

          <div>
            <Button variant="primary" disabled={busy} onClick={onGenerate}>
              {genLabel}
            </Button>
          </div>

          {job && job.images.length > 0 && (
            <div className="flex flex-col gap-2">
              <Text as="p" size="sm" className="text-theme-text-secondary">
                New variations (added to this character):
              </Text>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.images.map((img) => (
                  <ImageTile
                    key={img.id}
                    imageId={img.id}
                    alt="variation"
                    onClick={() =>
                      navigate(`/portrait/${img.id}`, { state: { spec: img.spec } })
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
