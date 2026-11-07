"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import { Button } from "@/components/ui/button";

/** Batch-action bar under the inventory table; hidden while nothing is selected. */
export function InventoryBatchFooter({
  selectedCount,
  onBatchDiscount,
  onBatchDelete,
}: {
  selectedCount: number;
  onBatchDiscount: () => void;
  onBatchDelete: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-low px-space-md py-3.5">
      <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-label-sm font-semibold text-on-primary">
        <MaterialIcon name="check_circle" className="text-[15px]" />
        Đã chọn {selectedCount} cuốn
      </div>
      <div className="mx-1 h-4 w-px bg-outline-variant" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={onBatchDiscount}
      >
        <MaterialIcon name="sell" className="text-[15px] text-tertiary" />
        Cập nhật giảm giá
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full text-error hover:bg-error-container"
        onClick={onBatchDelete}
      >
        <MaterialIcon name="delete_outline" className="text-[15px]" />
        Xóa khỏi kho
      </Button>
    </div>
  );
}
