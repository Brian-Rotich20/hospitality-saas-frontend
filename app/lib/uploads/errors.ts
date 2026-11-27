// User-facing messages for failed image uploads (POST /upload/image(s)).
import type { ApiError } from '../api/client';
import { ImagePrepError } from './prepare-image';

const MESSAGES: Record<string, string> = {
  FST_REQ_FILE_TOO_LARGE: 'This photo is larger than 5 MB. Choose a smaller photo.',
  FST_FILES_LIMIT: 'Too many photos in one go. Upload up to 10 at a time.',
  VENDOR_REQUIRED: 'Only vendor accounts can upload listing photos and logos.',
  STORAGE_UNAVAILABLE: 'Photo storage is temporarily unavailable. Please try again in a minute.',
  RATE_LIMITED: 'Too many uploads in a short time. Wait a minute and try again.',
  UNAUTHENTICATED: 'Your session has expired. Sign in again to upload photos.',
};

export function toUploadError(err: unknown): ApiError {
  if (err instanceof ImagePrepError) return { message: err.message, code: err.code };
  const e = (err ?? {}) as Partial<ApiError>;
  const code = e.code ?? (e.status === 413 ? 'FST_REQ_FILE_TOO_LARGE' : e.status === 429 ? 'RATE_LIMITED' : e.status === 401 ? 'UNAUTHENTICATED' : undefined);
  const message = (code && MESSAGES[code])
    // The API's 422 messages are already specific ("Unsupported file type. Allowed: …").
    ?? (e.status === 422 && e.message ? e.message : undefined)
    ?? (e.status === undefined ? 'Upload failed: check your connection and try again.' : 'The photo could not be uploaded. Please try again.');
  return { message, ...(code ? { code } : {}), ...(e.status !== undefined ? { status: e.status } : {}), ...(e.details ? { details: e.details } : {}) };
}
