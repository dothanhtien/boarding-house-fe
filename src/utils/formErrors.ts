import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiError } from "@/lib/axios";

export function applyApiFormErrors<T extends FieldValues>(
  error: ApiError,
  validFields: (keyof T & string)[],
  setError: UseFormSetError<T>,
  setGeneralError: (message: string) => void,
) {
  if (!error.errors) {
    setGeneralError(error.message);
    return;
  }

  const unmatchedMessages: string[] = [];

  for (const [field, messages] of Object.entries(error.errors)) {
    if ((validFields as string[]).includes(field)) {
      setError(field as Path<T>, { message: messages[0] });
    } else {
      unmatchedMessages.push(...messages);
    }
  }

  if (unmatchedMessages.length > 0) {
    setGeneralError(unmatchedMessages[0]);
  }
}
