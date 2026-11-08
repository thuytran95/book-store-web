"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";

type OrderSort = components["schemas"]["OrderSort"];

export const ORDER_SORT_OPTIONS: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "Mới đặt trước" },
  { value: "oldest", label: "Đặt lâu nhất trước" },
  { value: "total_desc", label: "Tổng tiền cao nhất" },
];

export function OrdersToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  q,
  onClearQuery,
}: {
  /** Raw input value; the feature debounces it into `q`. */
  search: string;
  onSearchChange: (v: string) => void;
  sort: OrderSort;
  onSortChange: (s: OrderSort) => void;
  /** Applied keyword, shown as a chip. */
  q: string;
  onClearQuery: () => void;
}) {
  return (
    <section aria-label="Tìm kiếm và sắp xếp" className="flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-xs">
        <label className="relative min-w-0 flex-1">
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
          />
          <input
            type="search"
            autoComplete="off"
            aria-label="Tìm đơn hàng"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã đơn, tên hoặc số điện thoại người nhận"
            className="h-11 w-full rounded-full bg-surface-container-lowest pl-11 pr-4 text-body-md text-on-surface shadow-pod outline-none transition-shadow placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="relative shrink-0">
          <span className="sr-only">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as OrderSort)}
            className="h-11 max-w-[44vw] cursor-pointer appearance-none truncate rounded-full bg-surface-container-lowest pl-space-md pr-10 text-label-md text-on-surface shadow-pod outline-none transition-colors hover:bg-surface-container-low focus:ring-2 focus:ring-primary/20 sm:max-w-none"
          >
            {ORDER_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <MaterialIcon
            name="swap_vert"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant"
          />
        </label>
      </div>

      {q && (
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-container pl-3 pr-1 text-label-md text-on-surface">
            Từ khóa: {q}
            <button
              type="button"
              aria-label="Bỏ từ khóa"
              onClick={onClearQuery}
              className="grid size-6 place-items-center rounded-full hover:bg-surface-container-high"
            >
              <MaterialIcon name="close" className="text-[16px]" />
            </button>
          </span>
        </div>
      )}
    </section>
  );
}
