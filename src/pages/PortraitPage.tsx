import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { LocalizedLink } from '../components/layout/LocalizedLink';
import {
  useCharacter,
  useCharacterBuilderClient,
  useCreateCharacter,
  useImage,
  useUpdateCharacterImageNote,
} from '@sudobility/characterbuilder_client';
import type { FaceSpec } from '@sudobility/characterbuilder_types';
import { VariationPanel } from '../components/VariationPanel';
import { FullBodyPanel } from '../components/FullBodyPanel';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';
import { downloadImage } from '../lib/download';
import { Button, Card, CardContent, Heading, Input, Label, Spinner, Text } from '../ui';

/**
 * The full-image screen for a single generated headshot. Two modes:
 * - A LOOSE image (not yet owned by a character): name it to keep it — that
 *   creates a character and adopts this image as its first headshot (1:M).
 * - A headshot that already belongs to a character: view it full-size and
 *   generate VARIATIONS (same face, mutable traits changed), which become more
 *   headshots of that character.
 *
 * Keyed by imageId. The owning generation supplies the spec (each image records
 * its own); navigation from a grid also passes it via router state as a fast path.
 */
export function PortraitPage() {
  const { imageId = '' } = useParams();
  const { navigate } = useLocalizedNavigate();
  const location = useLocation();
  const client = useCharacterBuilderClient();

  const stateSpec = (location.state as { spec?: FaceSpec } | null)?.spec;

  // Resolve the image directly by id (spec + owning character) — independent of
  // the generation-history page, so an older headshot still resolves.
  const { data: image, isLoading: imageLoading, isError } = useImage(imageId);
  const create = useCreateCharacter();
  const updateNote = useUpdateCharacterImageNote();
  const [imageNote, setImageNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  useEffect(() => setImageNote(image?.note ?? ''), [imageId, image?.note]);
  const onSaveNote = async () => {
    if (!ownerId) return;
    setNoteError(null);
    try {
      await updateNote.mutateAsync({
        characterId: ownerId, imageId, note: imageNote.trim() || null,
      });
    } catch (e) {
      setNoteError(e instanceof Error ? e.message : 'Could not save the image note');
    }
  };

  const spec: FaceSpec = image?.spec ?? stateSpec ?? {};
  const ownerId = image?.characterId ?? null;
  const isFullBody = image?.shot === 'full-length';
  const { data: owner } = useCharacter(ownerId ?? undefined);

  const [name, setName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Full-resolution image bytes (tiles are downscaled).
  const [url, setUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    if (!imageId) return;
    let revoked = false;
    let objectUrl: string | null = null;
    setUrl(null);
    setImgError(false);
    client
      .getImageBytes(imageId)
      .then((blob) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!revoked) setImgError(true);
      });
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, imageId]);

  useEffect(() => {
    const path = `/portrait/${imageId}`;
    const builder = BreadcrumbBuilder.getInstance();
    builder.setDynamicTitle(path, owner?.name ?? 'Portrait');
    return () => builder.clearDynamicTitle(path);
  }, [imageId, owner?.name]);

  const [downloading, setDownloading] = useState(false);
  const onDownload = () => {
    if (downloading) return;
    setDownloading(true);
    downloadImage(client, imageId)
      .catch(() => {})
      .finally(() => setDownloading(false));
  };

  // Name a loose image → create the character (adopting this image as its first
  // headshot) and go to the character.
  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || create.isPending) return;
    setSaveError(null);
    try {
      const character = await create.mutateAsync({
        name: trimmed,
        spec,
        previewImageId: imageId,
      });
      navigate(`/characters/${character.id}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save the character');
    }
  };

  const notFound = !imageLoading && (isError || !image);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Button variant="secondary" disabled={downloading} onClick={onDownload}>
          {downloading ? 'Downloading…' : 'Download'}
        </Button>
      </div>

      {/* Full-resolution image. */}
      <div className="flex min-h-[40vh] items-center justify-center overflow-hidden rounded-lg bg-theme-bg-secondary p-2">
        {url ? (
          <img
            src={url}
            alt={owner?.name || 'generated portrait'}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        ) : imgError ? (
          <Text as="span" className="text-theme-text-secondary">
            Image unavailable
          </Text>
        ) : (
          <Spinner size="large" />
        )}
      </div>

      {imageLoading ? (
        <Spinner size="default" />
      ) : ownerId ? (
        // Owned headshot: link back to the character + variation generator.
        <>
          <Card>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3 py-2">
                <Text as="p">
                  Part of{' '}
                  <LocalizedLink to={`/characters/${ownerId}`} className="font-medium underline">
                    {owner?.name ?? 'character'}
                  </LocalizedLink>
                </Text>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col gap-2 py-2">
                <Label htmlFor="portrait-note">Image note</Label>
                <Input
                  id="portrait-note"
                  value={imageNote}
                  maxLength={400}
                  onChange={(e) => setImageNote(e.target.value)}
                  placeholder="Add a note about this image"
                />
                {noteError && <Text as="p" size="sm" className="text-red-500">{noteError}</Text>}
                <Button
                  variant="secondary"
                  className="self-start"
                  disabled={updateNote.isPending || imageNote.trim() === (image?.note ?? '')}
                  onClick={onSaveNote}
                >
                  {updateNote.isPending ? 'Saving…' : 'Save note'}
                </Button>
              </div>
            </CardContent>
          </Card>
          {isFullBody ? (
            // Already a full-body sheet: make another with just a clothing change,
            // using THIS sheet as the reference so body + pose carry over.
            <FullBodyPanel key={`reclothe-${imageId}`} sourceImageId={imageId} characterId={ownerId} baseSpec={spec} fromSheet />
          ) : (
            <>
              <VariationPanel key={`var-${imageId}`} sourceImageId={imageId} characterId={ownerId} baseSpec={spec} />
              <FullBodyPanel key={`body-${imageId}`} sourceImageId={imageId} characterId={ownerId} baseSpec={spec} />
            </>
          )}
        </>
      ) : (
        // Loose candidate: name it to keep it as a character.
        <Card>
          <CardContent>
            <div className="flex flex-col gap-3 py-2">
              <Heading level={2} size="lg">
                Save as a character
              </Heading>
              <Text as="p" size="sm" className="text-theme-text-secondary">
                Give this face a name to keep it. You can name as many images from a
                run as you like — each becomes its own character.
              </Text>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cname">Name</Label>
                <Input
                  id="cname"
                  className="h-9"
                  value={name}
                  placeholder="e.g. Mara"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void onSave();
                  }}
                />
              </div>
              {saveError && (
                <Text as="p" size="sm" className="text-red-500">
                  {saveError}
                </Text>
              )}
              {notFound && (
                <Text as="p" size="sm" className="text-theme-text-secondary">
                  Couldn't find this image. It may still be rendering, or it belongs
                  to another account.
                </Text>
              )}
              <div>
                <Button
                  variant="primary"
                  disabled={create.isPending || !name.trim()}
                  onClick={onSave}
                >
                  {create.isPending ? 'Saving…' : 'Save as character'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
