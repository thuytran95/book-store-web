import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "./api/errors";

/**
 * Maps server VALIDATION_ERROR field errors onto react-hook-form fields.
 * Returns true if at least one field error was applied.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!isApiError(error) || error.code !== "VALIDATION_ERROR") return false;
  const entries = Object.entries(error.fieldErrors);
  for (const [field, message] of entries) {
    setError(field as Path<T>, { type: "server", message });
  }
  return entries.length > 0;
}
