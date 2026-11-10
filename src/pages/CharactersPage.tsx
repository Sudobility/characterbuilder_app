import { useMemo } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useCharacters } from '@sudobility/characterbuilder_client';
import { ImageTile } from '../components/ImageTile';
import { Button, Heading, Spinner, Text } from '../ui';

/**
 * Every character the user has named (master list). A character is an object that
 * owns many headshots; "deleting" one clears its name, so this list shows only
 * characters whose `name` is set. Clicking a card opens the character DETAIL view
 * (its headshots); from there a thumbnail opens the individual image.
 */
export function CharactersPage() {
  const { data, isLoading } = useCharacters();
  const { navigate } = useLocalizedNavigate();

  const named = useMemo(
    () => (data?.items ?? []).filter((c) => !!c.name),
    [data]
  );

  const openCharacter = (id: string) => navigate(`/characters/${id}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Heading level={1} size="2xl">
          Characters
        </Heading>
        <Button variant="primary" onClick={() => navigate('/new')}>
          New character
        </Button>
      </div>

      {isLoading ? (
        <Spinner size="large" />
      ) : named.length === 0 ? (
        <Text as="p" className="text-theme-text-secondary">
          No named characters yet — generate some images and name the ones you like.
        </Text>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {named.map((c) =>
            c.previewImageId ? (
              <div key={c.id} className="flex flex-col gap-1">
                <ImageTile
                  imageId={c.previewImageId}
                  alt={c.name ?? 'character'}
                  onClick={() => openCharacter(c.id)}
                />
                <Text as="span" size="sm" className="truncate font-medium">
                  {c.name}
                </Text>
              </div>
            ) : (
              <button
                key={c.id}
                type="button"
                onClick={() => openCharacter(c.id)}
                className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border border-theme-border bg-theme-bg-secondary p-3 text-center"
              >
                <Text as="span" size="sm" className="font-medium">
                  {c.name}
                </Text>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
