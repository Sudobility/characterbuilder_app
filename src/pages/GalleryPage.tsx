import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters, useGenerations } from '@sudobility/characterbuilder_client';
import { ImageTile } from '../components/ImageTile';
import { ImageLightbox } from '../components/ImageLightbox';
import { Button, Heading, Spinner, Text } from '../ui';

interface GalleryImage {
  imageId: string;
  characterId: string | null;
  role: string | null;
}

/**
 * A single grid of every generated image. Clicking a tile opens the full-res
 * lightbox, which links back to the image's character. Embedded with a
 * `characterId` it shows just that character's images (the "character → its
 * images" view).
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

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    chars?.items.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [chars]);

  const images = useMemo<GalleryImage[]>(() => {
    const out: GalleryImage[] = [];
    for (const g of data?.items ?? []) {
      if (characterId && g.characterId !== characterId) continue;
      for (const img of g.images) {
        out.push({ imageId: img.id, characterId: g.characterId, role: img.role ?? null });
      }
    }
    return out;
  }, [data, characterId]);

  const [active, setActive] = useState<GalleryImage | null>(null);

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
          {images.map((img) => (
            <ImageTile
              key={img.imageId}
              imageId={img.imageId}
              alt={img.role ?? 'generation'}
              label={img.role ?? undefined}
              onClick={() => setActive(img)}
            />
          ))}
        </div>
      )}

      {active && (
        <ImageLightbox
          imageId={active.imageId}
          characterId={active.characterId}
          characterName={active.characterId ? (nameById.get(active.characterId) ?? null) : null}
          role={active.role}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
