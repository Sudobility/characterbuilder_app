import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCharacter,
  useCharacterImages,
  useRemoveCharacterImage,
  useUpdateCharacter,
} from '@sudobility/characterbuilder_client';
import { ImageTile } from '../components/ImageTile';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';
import { Button, Card, CardContent, Heading, Input, Label, Spinner, Text } from '../ui';

/**
 * A character is an object that owns many headshots (1:M). This hub shows all of
 * the character's headshots, lets the user rename or "delete" it (delete = clear
 * the name, which hides it from the Characters list but keeps its images), and
 * links each headshot to its full-screen page where variations are generated.
 */
export function CharacterDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const { data: character, isLoading } = useCharacter(id);
  const { data: images } = useCharacterImages(id);
  const update = useUpdateCharacter();
  const removeImage = useRemoveCharacterImage();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const onRemoveImage = (imageId: string) => {
    if (removeImage.isPending) return;
    setRemovingId(imageId);
    removeImage.mutate(
      { characterId: id, imageId },
      { onSettled: () => setRemovingId(null) }
    );
  };

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setName(character?.name ?? '');
  }, [character?.name]);

  useEffect(() => {
    const path = `/characters/${id}`;
    const builder = BreadcrumbBuilder.getInstance();
    builder.setDynamicTitle(path, character?.name ?? 'Character');
    return () => builder.clearDynamicTitle(path);
  }, [id, character?.name]);

  const onRename = async () => {
    const trimmed = name.trim();
    if (!trimmed || update.isPending) return;
    setError(null);
    try {
      await update.mutateAsync({ id, req: { name: trimmed } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not rename the character');
    }
  };

  const onDelete = async () => {
    if (update.isPending) return;
    setError(null);
    try {
      await update.mutateAsync({ id, req: { name: null } });
      navigate('/dashboard/characters');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the character');
    }
  };

  if (isLoading) return <Spinner size="large" />;
  if (!character) {
    return (
      <Text as="p" className="text-theme-text-secondary">
        Character not found.
      </Text>
    );
  }

  const all = images ?? [];
  const headshots = all.filter((i) => i.shot !== 'full-length');
  const bodyShots = all.filter((i) => i.shot === 'full-length');

  const renderTiles = (list: typeof all) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {list.map((img) => (
        <div key={img.id} className="group relative">
          <ImageTile
            imageId={img.id}
            alt={character?.name ?? 'image'}
            selected={img.id === character?.previewImageId}
            onClick={() => navigate(`/portrait/${img.id}`, { state: { spec: img.spec } })}
          />
          {img.note && (
            <Text as="p" size="sm" className="mt-1 text-theme-text-secondary">
              {img.note}
            </Text>
          )}
          <button
            type="button"
            disabled={removeImage.isPending}
            title="Remove from this character (keeps it in your gallery)"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage(img.id);
            }}
            className="absolute left-2 top-2 z-10 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white opacity-0 transition hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-60"
          >
            {removingId === img.id ? 'Removing…' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-16">
      <Button variant="ghost" className="self-start" onClick={() => navigate('/dashboard/characters')}>
        ← All characters
      </Button>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-3 py-2">
            <Heading level={1} size="2xl">
              {character.name ?? 'Unnamed character'}
            </Heading>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="cname">Name</Label>
                <Input
                  id="cname"
                  className="h-9"
                  value={name}
                  placeholder="Character name"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void onRename();
                  }}
                />
              </div>
              <Button
                variant="primary"
                disabled={update.isPending || !name.trim() || name.trim() === character.name}
                onClick={onRename}
              >
                {update.isPending ? 'Saving…' : 'Rename'}
              </Button>
              <Button variant="ghost" disabled={update.isPending} onClick={onDelete}>
                Delete
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

      <div className="flex flex-col gap-3">
        <Heading level={2} size="xl">
          Headshots
        </Heading>
        <Text as="p" size="sm" className="text-theme-text-secondary">
          Tap a headshot to view it full-size and generate variations (younger,
          older, different hair, skin tone…) or a full-body character sheet.
        </Text>
        {headshots.length === 0 ? (
          <Text as="p" className="text-theme-text-secondary">
            No headshots yet.
          </Text>
        ) : (
          renderTiles(headshots)
        )}
      </div>

      {bodyShots.length > 0 && (
        <div className="flex flex-col gap-3">
          <Heading level={2} size="xl">
            Full-body character sheets
          </Heading>
          {renderTiles(bodyShots)}
        </div>
      )}

    </div>
  );
}
