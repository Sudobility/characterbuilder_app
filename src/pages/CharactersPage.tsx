import { useMemo } from 'react';
import { useLocalizedNavigate } from '@sudobility/characterbuilder_ui';
import { useCharacters } from '@sudobility/characterbuilder_client';
import { ImageTile } from '@sudobility/characterbuilder_ui';
import { LazyFlatList } from '@sudobility/components';
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
    () => (data?.data ?? []).filter((c) => !!c.name),
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
        <LazyFlatList
          items={named}
          keyExtractor={(c) => c.id}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          renderPlaceholder={() => (
            <div className="flex flex-col gap-1">
              <div className="aspect-[3/4] animate-pulse rounded-lg bg-theme-bg-secondary" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-theme-bg-secondary" />
            </div>
          )}
          renderItem={(c) =>
            c.previewImageId ? (
              <div className="flex flex-col gap-1">
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
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => openCharacter(c.id)}
                  aria-label={c.name ?? 'character'}
                  className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-secondary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-8 w-8 opacity-60"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
                    />
                  </svg>
                </button>
                <Text as="span" size="sm" className="truncate font-medium">
                  {c.name}
                </Text>
              </div>
            )
          }
        />
      )}
    </div>
  );
}
