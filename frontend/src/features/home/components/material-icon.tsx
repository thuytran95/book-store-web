import { cn } from "@/lib/utils";

export function MaterialIcon({
  name,
  className,
  label,
}: {
  name: string;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {name}
    </span>
  );
}
