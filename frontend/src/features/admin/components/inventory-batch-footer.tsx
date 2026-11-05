"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <span className="text-body-sm text-on-surface-variant">
          Hiển thị <strong>{start} - {end}</strong> trong tổng số <strong>{total}</strong> cuốn
        </span>
        <div className="flex items-center gap-1">
          <PageBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)} icon="chevron_left" />
          {pageNumbers(page, pageCount).map((p, i) =>
            p === "…" ? (
              <span key={`e-${i}`} className="px-1 text-label-sm text-on-surface-variant">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-label-sm transition-colors",
                  p === page
                    ? "bg-primary-container font-semibold text-on-primary shadow-sm"
                    : "text-on-surface hover:bg-surface-container",
                )}
              >
                {p}
              </button>
            ),
          )}
          <PageBtn disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} icon="chevron_right" />
        </div>
      </div>
    </div>
  );
}

function PageBtn({
  disabled,
  onClick,
  icon,
}: {
  disabled?: boolean;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors",
        disabled ? "cursor-not-allowed text-outline-variant" : "text-on-surface hover:bg-surface-container",
      )}
    >
      <MaterialIcon name={icon} className="text-[18px]" />
    </button>
  );
}

function pageNumbers(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) pages.push(p);
  if (page < pageCount - 2) pages.push("…");
  pages.push(pageCount);
  return pages;
}
