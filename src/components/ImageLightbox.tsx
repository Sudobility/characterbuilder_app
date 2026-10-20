import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacterBuilderClient } from '@sudobility/characterbuilder_client';
import { Spinner } from '../ui';
import { downloadImage } from '../lib/download';

/**
 * A full-screen viewer for a single generated image at its ORIGINAL resolution
 * (tiles show a downscaled thumbnail). Fetches the authenticated bytes, shows
 * them centered, and offers a link back to the owning character plus a
 * download. Closes on the backdrop, the ✕, or Escape.
 */
export function ImageLightbox({
  imageId,
  characterId,
  characterName,
  role,
  onClose,
}: {
  imageId: string;
  characterId?: string | null;
  characterName?: string | null;
  role?: string | null;
  onClose: () => void;
}) {
  const client = useCharacterBuilderClient();
  const [url, setUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;
    client
      .getImageBytes(imageId)
      .then((blob) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, imageId]);

  // Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onDownload = () => {
    if (downloading) return;
    setDownloading(true);
    downloadImage(client, imageId)
      .catch(() => {})
      .finally(() => setDownloading(false));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-sm">
          {role && <span className="rounded bg-white/15 px-2 py-0.5 capitalize">{role}</span>}
          {characterId && (
            <Link
              to={`/characters/${characterId}`}
              className="font-medium text-white hover:underline"
            >
              Go to {characterName ?? 'character'} →
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="rounded-md bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25 disabled:opacity-60"
          >
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/15 text-lg hover:bg-white/25"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {url ? (
          <img
            src={url}
            alt={role ?? 'generated image'}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Spinner size="large" />
        )}
      </div>
    </div>
  );
}
