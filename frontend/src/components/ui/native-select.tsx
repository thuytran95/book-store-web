import * as React from "react";
import { cn } from "@/lib/utils";

/** Chevron drawn as a background image so the native arrow can be hidden. */
const CHEVRON =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23707974' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[length:1rem_1rem] bg-[position:right_1rem_center] bg-no-repeat";

/** Styled native <select>: robust on mobile and trivially accessible. Same size as `Input` and the default `Button`. */
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(function NativeSelect({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full cursor-pointer appearance-none rounded-lg border border-input bg-transparent py-3 pl-4 pr-10 text-base leading-6 text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
        CHEVRON,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
