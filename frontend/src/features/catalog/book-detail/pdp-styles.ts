import { cn } from "@/lib/utils";

/** Serene Botanical PDP surfaces — see docs/prototype/book-detail-shop/DESIGN.md */
export const pdpCard =
  "rounded-2xl bg-card shadow-[0_8px_24px_-4px_rgba(27,77,62,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03)]";

export const pdpPillButtonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90";

export const pdpPillButtonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-muted px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted/80";

export const pdpStage =
  "rounded-2xl bg-muted/60 p-4";

export function pdpSurface(className?: string) {
  return cn(pdpCard, className);
}
