/**
 * Read an image File and return a downscaled JPEG data URL, so an uploaded photo
 * for analysis stays well within the provider's payload/size limits. Keeps aspect
 * ratio; never upscales. Falls back to the raw data URL if canvas isn't available.
 */
export async function fileToDownscaledDataUrl(
  file: File,
  maxDim = 768,
  quality = 0.85
): Promise<string> {
  const raw = await readAsDataUrl(file);
  try {
    const img = await loadImage(raw);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale >= 1) return raw;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return raw;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
