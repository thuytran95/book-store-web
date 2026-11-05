"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import { Button } from "@/components/ui/button";
import { Pager } from "@/components/shared/table-pagination";

export function InventoryBatchFooter({
  selectedCount,
  onBatchDiscount,
  onBatchDelete,
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  selectedCount: number;
  onBatchDiscount: () => void;
  onBatchDelete: () => void;
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-space-md bg-surface-container-low px-space-md py-3.5 md:flex-row">
      <div className="flex flex-wrap items-center gap-space-xs">
        {selectedCount > 0 ? (
          <>
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
          </>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-space-md">
        <Pager page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
