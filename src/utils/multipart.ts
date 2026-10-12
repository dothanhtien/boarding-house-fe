import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/config/media";

export type UploadProgressHandler = (percent: number) => void;

type FormFields = Record<
  string,
  string | number | null | undefined | (string | File)[]
>;

export function toFormData(fields: FormFields): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export function multipartConfig(onUploadProgress?: UploadProgressHandler) {
  return {
    timeout: MEDIA_UPLOAD_TIMEOUT_MS,
    onUploadProgress: onUploadProgress
      ? (event: { loaded: number; total?: number }) => {
          if (event.total) {
            onUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        }
      : undefined,
  };
}
