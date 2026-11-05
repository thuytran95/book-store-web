"use client";

import type { ReactNode } from "react";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { cn } from "@/lib/utils";

type Accent = "primary" | "secondary" | "tertiary";

const ICON_RING: Record<Accent, string> = {
  primary: "bg-surface-container-low text-primary",
  secondary: "bg-secondary-container/40 text-secondary",
  tertiary: "bg-tertiary-fixed/60 text-tertiary-container",
};

export function InventoryKpiCard({
  label,
  value,
  icon,
  accent = "primary",
  footer,
  isLoading,
  className,
}: {
  label: string;
  value: ReactNode;
  icon: string;
  accent?: Accent;
  footer?: ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-surface-container-lowest rounded-lg p-space-md shadow-[0_8px_24px_-4px_rgba(27,77,62,0.05)] min-h-[140px] animate-pulse",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-lg bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(27,77,62,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_28px_-4px_rgba(27,77,62,0.09)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
          <div className="text-headline-xl font-bold tracking-tight text-primary">{value}</div>
        </div>
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full shadow-sm",
            ICON_RING[accent],
          )}
        >
          <MaterialIcon name={icon} className="text-[24px]" />
        </div>
      </div>
      {footer ? <div className="mt-space-md">{footer}</div> : null}
      <div className="pointer-events-none absolute -bottom-4 -right-4 size-20 rounded-full bg-secondary-container/20 blur-xl" />
    </div>
  );
}
