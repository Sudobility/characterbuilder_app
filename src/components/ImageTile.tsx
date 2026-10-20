import { useEffect, useRef, useState } from 'react';
import { useCharacterBuilderClient } from '@sudobility/characterbuilder_client';
import { Spinner } from '../ui';
import { downloadImage } from '../lib/download';

/**
 * Fetches an authenticated image by id and shows it via an object URL.
 *
 * Generated images come back large (~1024px); a tile renders them small. Left
 * to the browser, that is a single harsh GPU downscale that aliases fine detail
 * (hair, skin texture) into visible "noise" — crisp again only when you zoom
 * in, because zooming shrinks the downscale factor. So before display we
 * downscale to roughly the tile's real pixel size with a high-quality,
 * step-halved canvas resample (`prepareThumbnail`), which removes the aliasing.
 * Any failure falls back to showing the original bytes unchanged.
 */
export function ImageTile({
  imageId,
  alt,
  label,
  selected,
  onSelect,
  onClick,
}: {
  imageId: string;
  alt: string;
  /** Optional caption shown at the bottom (e.g. a sheet view/direction role). */
  label?: string;
  /** When selection is enabled, whether this tile is the chosen one. */
  selected?: boolean;
  /** When provided, the tile becomes selectable (click picks it). */
  onSelect?: () => void;
  /** When provided (and not selectable), clicking the tile activates it (e.g. opens a lightbox). */
  onClick?: () => void;
}) {
  const client = useCharacterBuilderClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const onDownload = () => {
    if (downloading) return;
    setDownloading(true);
    downloadImage(client, imageId)
      .catch(() => {
        /* best-effort; the tile still shows the image */
      })
      .finally(() => setDownloading(false));
  };

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(false);

    // The tile's rendered pixel size (CSS px × DPR) is the most detail the
    // display can use; target the longer edge so a portrait image stays sharp
    // under `object-cover`. Fall back to a sensible size before first layout.
    const rect = containerRef.current?.getBoundingClientRect();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const targetEdge = Math.max(
      64,
      Math.round(Math.max(rect?.width ?? 0, rect?.height ?? 0) * dpr) || 512
    );

    client
      .getImageBytes(imageId)
      .then((blob) => prepareThumbnail(blob, targetEdge))
      .then((prepared) => {
        if (revoked) {
          URL.revokeObjectURL(prepared);
          return;
        }
        objectUrl = prepared;
        setUrl(prepared);
      })
      .catch(() => {
        if (!revoked) setError(true);
      });

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, imageId]);

  const activate = onSelect ?? onClick;
  const clickable = Boolean(activate);

  return (
    <div
      ref={containerRef}
      className={`group relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-theme-bg-secondary ${
        selected ? 'ring-2 ring-theme-accent-primary ring-offset-2 ring-offset-theme-bg-primary' : ''
      }`}
    >
      {url ? (
        <>
          {clickable ? (
            <button
              type="button"
              onClick={activate}
              aria-pressed={onSelect ? selected : undefined}
              aria-label={onSelect ? (selected ? 'Selected' : 'Select image') : 'View image'}
              className="absolute inset-0 h-full w-full cursor-pointer"
            >
              <img src={url} alt={alt} className="h-full w-full object-cover" />
            </button>
          ) : (
            <img src={url} alt={alt} className="h-full w-full object-cover" />
          )}

          {label && (
            <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {label}
            </span>
          )}

          {selected && (
            <span
              className="pointer-events-none absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent-primary text-white"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3.5 w-3.5">
                <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}

          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            aria-label="Download image"
            title="Download"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-60"
          >
            {downloading ? (
              <Spinner size="small" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M12 3v12" />
                <path d="m7 12 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            )}
          </button>
        </>
      ) : error ? (
        <span className="text-sm text-theme-text-secondary">unavailable</span>
      ) : (
        <Spinner size="default" />
      )}
    </div>
  );
}

/**
 * Returns an object URL for `blob` downscaled so its longer edge is about
 * `targetEdge` device pixels, using repeated halving (each step a high-quality
 * canvas resample) to avoid the aliasing a single large downscale produces.
 * Images already at or below the target, and any browser/decoding failure,
 * return the original bytes untouched — so this can only improve the result,
 * never degrade it.
 */
async function prepareThumbnail(blob: Blob, targetEdge: number): Promise<string> {
  try {
    if (typeof createImageBitmap !== 'function') return URL.createObjectURL(blob);
    const bitmap = await createImageBitmap(blob);
    try {
      const longest = Math.max(bitmap.width, bitmap.height);
      // Already small enough — re-encoding would only risk quality, so skip it.
      if (longest <= targetEdge * 1.5) return URL.createObjectURL(blob);

      const scale = targetEdge / longest;
      const outW = Math.max(1, Math.round(bitmap.width * scale));
      const outH = Math.max(1, Math.round(bitmap.height * scale));

      let curW = bitmap.width;
      let curH = bitmap.height;
      let canvas = draw(bitmap, curW, curH);

      // Halve until within 2× of the target, then land exactly on it.
      while (curW > outW * 2 && curH > outH * 2) {
        const nextW = Math.max(outW, Math.floor(curW / 2));
        const nextH = Math.max(outH, Math.floor(curH / 2));
        canvas = draw(canvas, nextW, nextH);
        curW = nextW;
        curH = nextH;
      }
      if (curW !== outW || curH !== outH) canvas = draw(canvas, outW, outH);

      const out = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      return out ? URL.createObjectURL(out) : URL.createObjectURL(blob);
    } finally {
      bitmap.close?.();
    }
  } catch {
    return URL.createObjectURL(blob);
  }
}

/** Draws a source onto a new high-quality-smoothed canvas of the given size. */
function draw(
  source: CanvasImageSource,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}
