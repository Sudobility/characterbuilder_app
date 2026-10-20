import type { CharacterBuilderClient } from '@sudobility/characterbuilder_client';

/**
 * Downloads a generated image to the user's device.
 *
 * Image bytes are auth-gated behind a bearer header (`GET /images/:id`), so a
 * plain `<a href>` would 401. We fetch the FULL-RESOLUTION blob through the
 * client (not the downscaled thumbnail `ImageTile` shows), wrap it in a
 * temporary object URL, and trigger a programmatic `<a download>` click, then
 * revoke the URL. Shared by the gallery, editor and sheet tiles.
 */
export async function downloadImage(
  client: CharacterBuilderClient,
  imageId: string,
  filename?: string
): Promise<void> {
  const blob = await client.getImageBytes(imageId);
  const ext = extensionForMime(blob.type);
  const name = filename ?? `${imageId}.${ext}`;
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Revoke on the next tick so the click's navigation has started.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    default:
      return 'png';
  }
}
