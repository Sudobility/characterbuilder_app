import { useEffect, useState } from 'react';
import { useCharacterBuilderClient } from '@sudobility/characterbuilder_client';
import { Spinner } from '../ui';

/** Fetches an authenticated image by id and shows it via an object URL. */
export function ImageTile({ imageId, alt }: { imageId: string; alt: string }) {
  const client = useCharacterBuilderClient();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(false);
    client
      .getImageBytes(imageId)
      .then((blob) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setError(true));
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, imageId]);

  return (
    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-theme-bg-secondary">
      {url ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" />
      ) : error ? (
        <span className="text-sm text-theme-text-secondary">unavailable</span>
      ) : (
        <Spinner size="default" />
      )}
    </div>
  );
}
