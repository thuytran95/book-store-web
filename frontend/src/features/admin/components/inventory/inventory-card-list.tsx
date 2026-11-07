"use client";

import Link from "next/link";
import { useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminInventoryRow } from "../../inventory/types";
import { InventoryAuthors, InventoryBookCover } from "./inventory-book-cover";
import { RowMenu, StockMeta, StockStepper, VisibilitySwitch } from "./inventory-row-controls";

const LONG_PRESS_MS = 500;
const INTERACTIVE = "button, a, input, label, [role=switch], [role=checkbox]";

/** Mobile (< md) book list. Long-press a card, or tap "Chọn", to start selecting. */
export function InventoryCardList({
  rows,
  total,
  selectedIds,
  onToggleRow,
  isLoading,
  onDelete,
  selectMode,
  onSelectModeChange,
}: {
  rows: AdminInventoryRow[];
  total: number;
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  isLoading?: boolean;
  onDelete: (row: AdminInventoryRow) => void;
  selectMode: boolean;
  onSelectModeChange: (on: boolean) => void;
}) {
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);

  const cancelPress = () => window.clearTimeout(pressTimer.current);

  const onPointerDown = (e: React.PointerEvent, id: number) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      if (!selectMode) onSelectModeChange(true);
      if (!selectedIds.has(id)) onToggleRow(id);
      navigator.vibrate?.(10);
    }, LONG_PRESS_MS);
  };

  const onCardClick = (e: React.MouseEvent, id: number) => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (!selectMode || (e.target as HTMLElement).closest(INTERACTIVE)) return;
    onToggleRow(id);
  };

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-space-sm">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>
            <Skeleton className="h-44 rounded-lg" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between px-1">
        <span className="text-body-sm text-on-surface-variant">{total} cuốn</span>
        <button
          type="button"
          onClick={() => onSelectModeChange(!selectMode)}
          className="rounded-full px-3 py-1.5 text-label-lg font-semibold text-primary hover:bg-surface-container-low"
        >
          {selectMode ? "Xong" : "Chọn"}
        </button>
      </div>
      <ul className="flex flex-col gap-space-sm">
        {rows.map((row) => {
          const selected = selectedIds.has(row.id);
          return (
            <li
              key={row.id}
              onPointerDown={(e) => onPointerDown(e, row.id)}
              onPointerUp={cancelPress}
              onPointerCancel={cancelPress}
              onPointerMove={cancelPress}
              onClick={(e) => onCardClick(e, row.id)}
              className={cn(
                "flex select-none flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-pod transition-shadow",
                selected && "bg-secondary-container/10 ring-2 ring-secondary",
              )}
            >
              <div className="flex items-start gap-3">
                {selectMode && (
                  <Checkbox
                    aria-label={`Chọn ${row.title}`}
                    checked={selected}
                    onCheckedChange={() => onToggleRow(row.id)}
                    className="mt-1"
                  />
                )}
                <div className={cn("flex min-w-0 flex-1 gap-3", !row.isVisible && "opacity-60")}>
                  <InventoryBookCover row={row} className="h-[68px] w-12" sizes="48px" />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/books/${row.id}`}
                      className="line-clamp-2 text-body-lg font-medium text-on-surface"
                    >
                      {row.title}
                    </Link>
                    <div className="truncate text-body-sm text-on-surface-variant">
                      <InventoryAuthors row={row} />
                    </div>
                    <div className="mt-0.5 text-body-sm">
                      <span className="font-semibold tabular-nums text-on-surface">
                        {formatVnd(row.salePrice)}
                      </span>
                      <span className="text-on-surface-variant">
                        {" · "}
                        <span className="tabular-nums">{row.conditionPct}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="-mr-2 -mt-2">
                  <RowMenu row={row} onDelete={onDelete} size="lg" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-2">
                  <span className="text-label-md text-on-surface-variant">Tồn</span>
                  <StockStepper row={row} size="lg" />
                </div>
                <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                  Hiện trên shop
                  <VisibilitySwitch row={row} size="lg" />
                </div>
              </div>
              <StockMeta row={row} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
