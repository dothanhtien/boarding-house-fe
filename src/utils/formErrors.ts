import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiError } from "@/lib/axios";

export function toFormFieldPath(apiField: string) {
  return apiField
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map((segment) => segment.charAt(0).toLowerCase() + segment.slice(1))
    .join(".");
}

const toPathPattern = (path: string) => path.replace(/\.\d+(?=\.|$)/g, ".*");

export function applyApiFormErrors<T extends FieldValues>(
  error: ApiError,
  validFields: (keyof T & string)[],
  setError: UseFormSetError<T>,
  setGeneralError: (message: string) => void,
  nestedFields: string[] = [],
) {
  if (!error.errors) {
    setGeneralError(error.message);
    return;
  }

  const unmatchedMessages: string[] = [];
  let appliedFieldMessage = false;

  for (const [field, messages] of Object.entries(error.errors)) {
    if (messages.length === 0) continue;

    const path = toFormFieldPath(field);
    const isRendered = path.includes(".")
      ? nestedFields.includes(toPathPattern(path))
      : (validFields as string[]).includes(path);
    if (isRendered) {
      setError(path as Path<T>, { message: messages[0] });
      appliedFieldMessage = true;
    } else {
      unmatchedMessages.push(...messages);
    }
  }

  if (unmatchedMessages.length > 0) {
    setGeneralError(unmatchedMessages[0]);
  } else if (!appliedFieldMessage) {
    setGeneralError(error.message);
  }
}
