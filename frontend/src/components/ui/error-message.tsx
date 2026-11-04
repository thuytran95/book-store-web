import { errorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/utils";

/** Maps `ApiError.code` to Vietnamese text. Renders nothing without an error. */
export function ErrorMessage({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className={cn("text-sm text-destructive", className)}>
      {errorMessage(error)}
    </p>
  );
}
