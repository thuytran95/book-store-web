"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import { cn } from "@/lib/utils";

export type InventoryBulkAction = "hide" | "show" | "delete";

const ACTION =
  "inline-flex h-10 items-center gap-1.5 rounded-full px-space-sm text-label-lg font-semibold transition-colors disabled:opacity-50";

/** Sticky toolbar for the selected books. Hidden when nothing is selected. */
export function InventoryBulkBar({
  selectedCount,
  onAction,
  onClear,
  pending,
}: {
  selectedCount: number;
  onAction: (action: InventoryBulkAction) => void;
  onClear: () => void;
  pending: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 -mx-space-md pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-space-xs md:static md:mx-0 md:pb-0">
      <div
        role="toolbar"
        aria-label="Thao tác với sách đã chọn"
        className="flex flex-wrap items-center gap-1 rounded-lg px-space-md py-2 text-white shadow-float md:rounded-full"
        style={{ backgroundColor: "var(--on-surface)" }}
      >
        <span className="mr-auto flex items-center gap-1.5 text-body-md">
          <MaterialIcon name="check_circle" className="text-[18px] text-secondary-container" />
          Đã chọn <b className="font-semibold tabular-nums">{selectedCount}</b> cuốn
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => onAction("hide")}
          className={cn(ACTION, "hover:bg-white/10")}
        >
          <MaterialIcon name="visibility_off" className="text-[18px]" />
          Ẩn
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onAction("show")}
          className={cn(ACTION, "hover:bg-white/10")}
        >
          <MaterialIcon name="visibility" className="text-[18px]" />
          Hiện
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onAction("delete")}
          className={cn(ACTION, "text-[#ffb4ab] hover:bg-white/10")}
        >
          <MaterialIcon name="delete" className="text-[18px]" />
          Xóa khỏi kho
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onClear}
          className={cn(ACTION, "text-white/80 hover:bg-white/10")}
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  );
}
