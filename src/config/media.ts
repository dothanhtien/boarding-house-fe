export const MEDIA_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MEDIA_MAX_FILE_NAME_LENGTH = 255;
export const MEDIA_MAX_FILES_PER_REQUEST = 5;
export const MEDIA_ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MEDIA_UPLOAD_TIMEOUT_MS = 120_000;
