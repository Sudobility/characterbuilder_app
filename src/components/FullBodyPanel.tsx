import { useEffect, useState } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useQueryClient } from '@tanstack/react-query';
import {
  isInsufficientCredits,
  useCharacterBuilderClient,
  useGenerate,
  useGeneration,
} from '@sudobility/characterbuilder_client';
import type { FaceSpec } from '@sudobility/characterbuilder_types';
import { ImageTile } from './ImageTile';
import { blobToDownscaledDataUrl, fileToDownscaledDataUrl } from '../lib/image';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextArea,
} from '../ui';

const COUNTS = ['1', '2', '3', '4'];

/**
 * Generate a full-body CHARACTER SHEET of the SAME person as a headshot: a
 * single image with full-length front / side / back views in a neutral pose on a
 * plain background. The headshot is passed as a reference (identity), the
 * person's trait spec is reused, the framing is forced to full-length, and the
 * user's free-text instructions (mostly clothing) are appended. Results are
 * assigned to the character, shown under "Full-body character sheets".
 */
export function FullBodyPanel({
  sourceImageId,
  characterId,
  baseSpec,
  fromSheet = false,
}: {
  sourceImageId: string;
  characterId: string;
  baseSpec: FaceSpec;
  /**
   * When the source is already a full-body sheet (not a headshot): keep the body
   * and pose, change ONLY the clothing. Otherwise build a new sheet from a face.
   */
  fromSheet?: boolean;
}) {
  const client = useCharacterBuilderClient();
  const { navigate } = useLocalizedNavigate();
  const qc = useQueryClient();

  const [instructions, setInstructions] = useState('');
  const [count, setCount] = useState('1');
  // Optional clothing reference photos (data URLs), passed to the generator
  // alongside the headshot so it can dress the character from the images.
  const [clothing, setClothing] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_CLOTHING = 4;
  const onAddClothing = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_CLOTHING - clothing.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    const urls = await Promise.all(picked.map((f) => fileToDownscaledDataUrl(f, 1024)));
    setClothing((c) => [...c, ...urls].slice(0, MAX_CLOTHING));
  };

  const generate = useGenerate();
  const { data: job } = useGeneration(jobId ?? undefined);
  const jobActive = !!jobId && job?.status !== 'succeeded' && job?.status !== 'failed';
  const busy = generate.isPending || jobActive;

  const n = Number(count);
  const genLabel = generate.isPending
    ? 'Enqueuing…'
    : jobActive
      ? job?.status === 'running'
        ? 'Rendering…'
        : 'Queued…'
      : `Generate character sheet${n > 1 ? 's' : ''} (${n} credit${n > 1 ? 's' : ''})`;

  const onGenerate = async () => {
    setError(null);
    setJobId(null);

    // Pass the headshot as a reference so the body shot is the same person.
    let referenceImage: string | undefined;
    try {
      const blob = await client.getImageBytes(sourceImageId);
      referenceImage = await blobToDownscaledDataUrl(blob);
    } catch {
      referenceImage = undefined; // best-effort; the spec still drives the face
    }

    const clothingText = instructions.trim();
    const base = fromSheet
      ? // Source is already a full-body sheet — keep everything, reclothe only.
        `A full-body character sheet of the same person as the FIRST reference ` +
        `image, keeping their face, body, proportions, pose and composition ` +
        `(full-length front, side and back views on a plain neutral background) ` +
        `EXACTLY the same — change ONLY the clothing.`
      : // Source is a headshot — build a full body from the face.
        `A full-body character sheet of the same person as the FIRST reference ` +
        `image (their face and identity): full-length front, side and back views, ` +
        `standing in a neutral A-pose on a plain neutral background, consistent ` +
        `proportions and identity across all views.`;
    const description =
      base +
      (clothing.length
        ? ` Dress them in the clothing/outfit shown in the additional reference images.`
        : '') +
      (clothingText ? ` ${clothing.length ? 'Also: ' : 'Wearing: '}${clothingText}.` : '');

    generate.mutate(
      {
        spec: baseSpec,
        characterId,
        ...(referenceImage ? { referenceImage } : {}),
        ...(clothing.length ? { referenceImages: clothing } : {}),
        description,
        params: {
          count: n,
          // Wide canvas so the front/side/back views sit side by side.
          size: 'landscape',
          shot: 'full-length',
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
          {fromSheet ? 'New sheet — change clothing' : 'Full-body character sheet'}
        </Heading>
        <Text as="p" size="sm" className="text-theme-text-secondary">
          {fromSheet
            ? 'Generate another character sheet of this person with different clothing — the face, body and pose stay the same. Describe the outfit and/or upload clothing photos.'
            : 'Make a full-body character sheet of this person — front, side and back views on one plain-background sheet. Describe what you want, mostly the clothing (e.g. "a charcoal three-piece suit" or "worn fisherman\'s oilskins and rubber boots"). Their face and build stay the same.'}
        </Text>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="fullbody-instructions">Instructions (clothing, pose, setting)</Label>
            <TextArea
              value={instructions}
              onChange={setInstructions}
              rows={3}
              placeholder='e.g. "a tailored navy suit with brown leather shoes, standing against a plain studio backdrop"'
            />
          </div>

          {/* Optional clothing reference photos, used alongside the text. */}
          <div className="flex flex-col gap-2">
            <Label>Clothing photos (optional)</Label>
            <Text as="p" size="xs" className="text-theme-text-secondary">
              Upload up to {MAX_CLOTHING} images of the outfit to dress the character in.
            </Text>
            <div className="flex flex-wrap items-center gap-2">
              {clothing.map((url, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-md border border-theme-border">
                  <img src={url} alt={`clothing ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setClothing((c) => c.filter((_, j) => j !== i))}
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {clothing.length < MAX_CLOTHING && (
                <label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                  + Add photo
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void onAddClothing(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Number of images</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="h-9 w-40">
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
                New character sheets (added to this character):
              </Text>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.images.map((img) => (
                  <ImageTile
                    key={img.id}
                    imageId={img.id}
                    alt="full-body character sheet"
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
