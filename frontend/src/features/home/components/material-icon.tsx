import { cn } from "@/lib/utils";

export function MaterialIcon({
  name,
  className,
  label,
  filled,
}: {
  name: string;
  className?: string;
  label?: string;
  /** Material Symbols FILL axis (1 = filled glyph). */
  filled?: boolean;
}) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {name}
    </span>
  );
}
