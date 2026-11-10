import { cn } from "@/lib/utils";

/** Rotating ring in a light primary green (no background fill). */
export function Spinner({ className, label = "Đang tải" }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-10 animate-spin rounded-full border-4 border-primary-fixed border-t-on-primary-container",
        className,
      )}
    />
  );
}

/** Full-width centered spinner block for page/section loading states. */
export function LoadingBlock({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-64 w-full items-center justify-center", className)}>
      <Spinner />
    </div>
  );
}
