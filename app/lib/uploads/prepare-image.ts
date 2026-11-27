'use client';

// Makes a photo uploadable before it is sent. The API accepts JPEG, PNG and WebP up to
// 5 MB (MAX_FILE_SIZE) and re-encodes everything to WebP at most 1920 px, so sending a
// 10 MB, 4000 px phone photo only wastes data and gets rejected. Files that are already
// small JPEG/PNG/WebP pass through untouched; larger or other decodable images are
// resized in the browser (EXIF rotation applied) and re-encoded.

const SERVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 4.5 * 1024 * 1024; // under the 5 MB server limit, leaving room for multipart overhead
const MAX_DIM = 2560;                 // the server stores at most 1920 px; keep some headroom

export class ImagePrepError extends Error {
  readonly code = 'IMAGE_UNREADABLE';
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
    throw new ImagePrepError(isHeic
      ? 'This photo is in HEIC format, which this browser can’t read. Choose it again from your Photos app, or export it as JPG.'
      : `“${file.name}” isn’t an image we can read. Use a JPG, PNG or WebP photo.`);
  }
}

/** Returns a File the API will accept (or the original when it already is one). */
export async function prepareImage(file: File): Promise<File> {
  if (SERVER_TYPES.includes(file.type) && file.size <= MAX_BYTES) return file;
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return file;

  const bitmap = await decode(file);
  let scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';

  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) break;
    if (!keepAlpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const quality = 0.86 - attempt * 0.08;
    // WebP keeps transparency and is smaller; browsers without a WebP encoder return PNG,
    // in which case fall back to JPEG.
    let blob = await toBlob(canvas, 'image/webp', quality);
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality);
    if (blob && blob.size <= MAX_BYTES) {
      bitmap.close();
      const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
      return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.${ext}`, { type: blob.type, lastModified: Date.now() });
    }
    scale *= 0.8;
  }
  bitmap.close();
  throw new ImagePrepError(`“${file.name}” is too large to upload. Use a photo under 5 MB.`);
}
