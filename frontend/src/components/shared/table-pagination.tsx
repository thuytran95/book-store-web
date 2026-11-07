"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import { getPageWindow } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PagerProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const PAGE_BUTTON =
  "flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-label-md tabular-nums transition-colors";

/** Round page buttons: chevrons, numbers with gaps, current page filled (admin prototype pager). */
export function Pager({
  page,
  pageCount,
  onPageChange,
  className,
}: PagerProps) {
  return (
    <nav
      aria-label="Phân trang"
      className={cn("flex items-center gap-1", className)}
    >
      <PageArrow
        icon="chevron_left"
        label="Trang trước"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      {getPageWindow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="px-1 text-label-md text-on-surface-variant"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Trang ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              PAGE_BUTTON,
              "cursor-pointer",
              p === page
                ? "bg-primary text-on-primary"
                : "text-on-surface hover:bg-surface-container-low",
            )}
          >
            {p}
          </button>
        ),
      )}
      <PageArrow
        icon="chevron_right"
        label="Trang sau"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}

function PageArrow({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={cn(
        PAGE_BUTTON,
        "text-on-surface",
        disabled
          ? "cursor-not-allowed opacity-35"
          : "cursor-pointer hover:bg-surface-container-low",
      )}
    >
      <MaterialIcon name={icon} className="text-[18px]" />
    </button>
  );
}

/**
 * Table footer bar: "Hiển thị start–end / total <itemLabel>" plus the pager. Spread the result of
 * `usePagination` / `useClientPagination` into it: `<TablePagination {...pagination} itemLabel="thể loại" />`.
 */
export function TablePagination({
  page,
  pageCount,
  start,
  end,
  total,
  setPage,
  itemLabel = "mục",
  children,
  className,
}: {
  page: number;
  pageCount: number;
  start: number;
  end: number;
  total: number;
  setPage: (page: number) => void;
  /** Noun after the count, e.g. "thể loại", "cuốn". */
  itemLabel?: string;
  /** Optional content on the left instead of the range text (e.g. batch actions). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-space-md text-body-sm text-on-surface-variant",
        className,
      )}
    >
      {children ?? (
        <span>
          Hiển thị{" "}
          <span className="tabular-nums text-on-surface">
            {start}–{end}
          </span>{" "}
          / <span className="tabular-nums text-on-surface">{total}</span> {itemLabel}
        </span>
      )}
      <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
