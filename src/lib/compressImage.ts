const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

/**
 * Downscale+recompress a photo in the browser before it's even sent to our
 * backend. Phone camera photos routinely run 5-15MB; uploading that over a
 * slow mobile connection is the dominant cost in the whole upload — bigger
 * than anything the backend does afterwards — and is the likely cause of
 * "Failed to fetch" on photo uploads specifically. Falls back to the
 * original file untouched if the browser can't decode it — the backend
 * still applies its own best-effort resize in that case.
 *
 * Uses the classic Image()+canvas decode path rather than createImageBitmap
 * — createImageBitmap is comparatively recent and support is inconsistent
 * across the embedded WebViews different Telegram clients use, whereas
 * loading via an <img> element has worked the same way for well over a
 * decade everywhere.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error('file read failed'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image decode failed'));
      el.src = dataUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** True if a file is still too large to reasonably upload after compression
 * was attempted (or skipped) — lets the caller show a clear message instead
 * of letting a doomed request run into a network timeout. */
export function isTooLargeToUpload(file: File): boolean {
  return file.size > MAX_UPLOAD_BYTES;
}
