import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A `next/link` styled as a pill button. Use it for every navigation that looks like a button
 * (for actions without navigation, use `Button`). Text is always 16px.
 */
export const linkButtonVariants = cva(
  "cursor-pointer inline-flex shrink-0 items-center justify-center gap-space-xs rounded-full text-base font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        filled:
          "bg-primary text-on-primary shadow-[0_8px_24px_-4px_rgba(27,77,62,0.18)] hover:bg-primary-dark",
        outline:
          "border-[1.5px] border-primary-container bg-surface-container-lowest text-primary hover:bg-surface-container",
      },
      size: {
        default: "px-6 py-2.5",
        sm: "px-4 py-1.5",
      },
    },
    defaultVariants: { variant: "filled", size: "default" },
  },
);

export type LinkButtonProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof linkButtonVariants>;

export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      data-slot="link-button"
      className={cn(linkButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
