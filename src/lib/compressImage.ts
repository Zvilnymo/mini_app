const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

/**
 * Downscale+recompress a photo in the browser before it's even sent to our
 * backend. Phone camera photos routinely run 5-15MB; uploading that over a
 * slow mobile connection is the dominant cost in the whole upload — bigger
 * than anything the backend does afterwards — and is the likely cause of
 * "Failed to fetch" on photo uploads specifically. Falls back to the
 * original file untouched if the browser can't decode it (e.g. HEIC on a
 * WebView without native support) — the backend still applies its own
 * best-effort resize in that case.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
