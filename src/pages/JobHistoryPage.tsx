import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacters, useGenerations } from '@sudobility/characterbuilder_client';
import type { Generation } from '@sudobility/characterbuilder_types';
import { ImageTile } from '../components/ImageTile';
import { ImageLightbox } from '../components/ImageLightbox';
import { Badge, Button, Card, CardContent, Heading, Spinner, Text } from '../ui';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const STATUS: Record<string, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'info', label: 'Queued' },
  running: { variant: 'primary', label: 'Rendering' },
  succeeded: { variant: 'success', label: 'Succeeded' },
  failed: { variant: 'danger', label: 'Failed' },
};

const KIND_LABEL: Record<string, string> = {
  face: 'Portrait',
  'head-sheet': 'Head sheet',
  'body-sheet': 'Body sheet',
  'clothed-sheet': 'Clothed sheet',
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

interface ActiveImage {
  imageId: string;
  characterId: string | null;
  role: string | null;
}

/**
 * The generation job history: every generation (portrait or sheet stage) with its
 * live status, kind, time, credits, result thumbnails and — when failed — the
 * error. Polls while any job is still running. The one place to see whether a
 * generation actually succeeded.
 */
export function JobHistoryPage() {
  const { data, isLoading } = useGenerations({ limit: 50 });
  const { data: chars } = useCharacters();
  const navigate = useNavigate();
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    chars?.items.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [chars]);
  const [active, setActive] = useState<ActiveImage | null>(null);

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Heading level={1} size="2xl">
          Job history
        </Heading>
        <Button variant="primary" onClick={() => navigate('/new')}>
          New character
        </Button>
      </div>

      {isLoading ? (
        <Spinner size="large" />
      ) : items.length === 0 ? (
        <Text as="p" className="text-theme-text-secondary">
          No generations yet. Press “New character” to design and generate one.
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((g) => (
            <JobRow
              key={g.id}
              g={g}
              characterName={g.characterId ? (nameById.get(g.characterId) ?? null) : null}
              onImage={setActive}
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

function JobRow({
  g,
  characterName,
  onImage,
}: {
  g: Generation;
  characterName: string | null;
  onImage: (img: ActiveImage) => void;
}) {
  const status = STATUS[g.status] ?? STATUS.pending!;
  const active = g.status === 'pending' || g.status === 'running';
  const kind = KIND_LABEL[g.kind ?? 'face'] ?? 'Portrait';

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Badge variant={status.variant} dot={active}>
              {status.label}
            </Badge>
            <Text as="span" className="font-medium">
              {kind}
            </Text>
            {g.characterId && (
              <Link
                to={`/characters/${g.characterId}`}
                className="text-sm text-theme-accent hover:underline"
              >
                {characterName ?? 'character'}
              </Link>
            )}
            <span className="flex-1" />
            {g.creditsSpent > 0 && (
              <Text as="span" size="sm" className="text-theme-text-secondary">
                {g.creditsSpent} credit{g.creditsSpent > 1 ? 's' : ''}
              </Text>
            )}
            <Text as="span" size="sm" className="text-theme-text-secondary">
              {timeAgo(g.createdAt)}
            </Text>
          </div>

          {active && (
            <div className="flex items-center gap-2">
              <Spinner size="small" />
              <Text as="span" size="sm" className="text-theme-text-secondary">
                {g.status === 'running' ? 'Rendering…' : 'Queued…'} this can take a while.
              </Text>
            </div>
          )}

          {g.status === 'failed' && (
            <Text as="p" size="sm" className="text-red-500">
              {g.error ?? 'Generation failed.'}
            </Text>
          )}

          {g.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {g.images.map((img) => (
                <ImageTile
                  key={img.id}
                  imageId={img.id}
                  alt={img.role ?? kind}
                  label={img.role ?? undefined}
                  onClick={() =>
                    onImage({
                      imageId: img.id,
                      characterId: g.characterId,
                      role: img.role ?? null,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
