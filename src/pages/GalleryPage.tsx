import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters, useGenerations } from '@sudobility/characterbuilder_client';
import type { FaceSpec } from '@sudobility/characterbuilder_types';
import { ImageTile } from '../components/ImageTile';
import { Button, Heading, Spinner, Text } from '../ui';

interface GalleryImage {
  imageId: string;
  characterId: string | null;
  role: string | null;
  spec: FaceSpec | undefined;
}

// The image's own character link (set when a headshot is named or generated as a
// variation) is authoritative — a loose run's generation has no characterId even
// though one of its images may have been named into a character.

/**
 * A single grid of every generated image. Clicking a tile opens that image's
 * full-screen portrait page, where it can be named (kept as a character) or, if
 * already a character, renamed/deleted. Embedded with a `characterId` it shows
 * just that character's images.
 */
export function GalleryPage({
  characterId,
  title = 'Gallery',
}: {
  characterId?: string;
  title?: string;
} = {}) {
  const { data, isLoading } = useGenerations();
  const { data: chars } = useCharacters();
  const navigate = useNavigate();

  // Character name by character id, so a headshot can be badged with its name.
  const nameByCharId = useMemo(() => {
    const m = new Map<string, string>();
    chars?.items.forEach((c) => {
      if (c.name) m.set(c.id, c.name);
    });
    return m;
  }, [chars]);

  const images = useMemo<GalleryImage[]>(() => {
    const out: GalleryImage[] = [];
    for (const g of data?.items ?? []) {
      for (const img of g.images) {
        const imgCharId = img.characterId ?? null;
        if (characterId && imgCharId !== characterId) continue;
        out.push({
          imageId: img.id,
          characterId: imgCharId,
          role: img.role ?? null,
          spec: img.spec,
        });
      }
    }
    return out;
  }, [data, characterId]);

  const open = (img: GalleryImage) =>
    navigate(`/portrait/${img.imageId}`, { state: { spec: img.spec } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Heading level={characterId ? 2 : 1} size={characterId ? 'xl' : '2xl'}>
          {title}
        </Heading>
        {!characterId && (
          <Button variant="primary" onClick={() => navigate('/new')}>
            New character
          </Button>
        )}
      </div>

      {isLoading ? (
        <Spinner size="large" />
      ) : images.length === 0 ? (
        <Text as="p" className="text-theme-text-secondary">
          {characterId ? 'No images for this character yet.' : 'No generated images yet.'}
        </Text>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => {
            const name = img.characterId ? nameByCharId.get(img.characterId) : undefined;
            return (
              <ImageTile
                key={img.imageId}
                imageId={img.imageId}
                alt={name ?? img.role ?? 'generation'}
                label={name ?? img.role ?? undefined}
                onClick={() => open(img)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
