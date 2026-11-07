"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import {
  CONDITION_FILTER,
  type ConditionKey,
  SORT_OPTIONS,
} from "../../inventory/types";

type Category = components["schemas"]["CategoryRead"];

const CONDITION_OPTIONS = [
  { value: "", label: "Mọi tình trạng" },
  ...(Object.keys(CONDITION_FILTER) as ConditionKey[]).map((k) => ({
    value: k,
    label: CONDITION_FILTER[k].label,
  })),
];

export function InventoryToolbar({
  search,
  onSearchChange,
  categorySlug,
  onCategoryChange,
  conditionKey,
  onConditionChange,
  sort,
  onSortChange,
  categories,
  authorName,
  onClearAuthor,
  activeCount,
  onReset,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  categorySlug: string;
  onCategoryChange: (slug: string) => void;
  conditionKey: ConditionKey | "";
  onConditionChange: (key: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  categories: Category[];
  /** Set when the list is filtered by author (`?author_id=`). */
  authorName?: string;
  onClearAuthor: () => void;
  activeCount: number;
  onReset: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const selects = (full: boolean) => (
    <>
      <FilterSelect
        label="Thể loại"
        full={full}
        value={categorySlug}
        onChange={onCategoryChange}
        options={[
          { value: "", label: "Tất cả thể loại" },
          ...categories.map((c) => ({ value: c.slug, label: c.name })),
        ]}
      />
      <FilterSelect
        label="Tình trạng"
        full={full}
        value={conditionKey}
        onChange={onConditionChange}
        options={CONDITION_OPTIONS}
      />
      <FilterSelect
        label="Sắp xếp"
        full={full}
        value={sort}
        onChange={onSortChange}
        options={SORT_OPTIONS}
        icon="swap_vert"
        highlighted={sort !== "newest"}
      />
    </>
  );

  const chips: { key: string; text: string; onClear: () => void }[] = [];
  if (search.trim()) {
    chips.push({ key: "q", text: `Từ khóa: ${search.trim()}`, onClear: () => onSearchChange("") });
  }
  if (authorName !== undefined) {
    chips.push({ key: "author", text: `Tác giả: ${authorName}`, onClear: onClearAuthor });
  }
  if (categorySlug) {
    const name = categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;
    chips.push({ key: "cat", text: `Thể loại: ${name}`, onClear: () => onCategoryChange("") });
  }
  if (conditionKey) {
    chips.push({
      key: "cond",
      text: `Tình trạng: ${CONDITION_FILTER[conditionKey].label}`,
      onClear: () => onConditionChange(""),
    });
  }

  return (
    <section aria-label="Tìm kiếm và lọc" className="flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-xs">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Tìm sách</span>
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
          />
          <input
            type="search"
            autoComplete="off"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả hoặc mã MS-…"
            className="h-11 w-full rounded-full bg-surface-container-lowest pl-11 pr-4 text-body-md text-on-surface shadow-pod outline-none transition-shadow placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="hidden items-center gap-space-xs md:flex">{selects(false)}</div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative flex h-11 shrink-0 items-center gap-1 rounded-full bg-surface-container-lowest px-space-md text-label-lg text-on-surface shadow-pod md:hidden"
        >
          <MaterialIcon name="tune" className="text-[18px]" />
          Lọc
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-on-primary">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-space-xs">
          {chips.map((c) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 rounded-full bg-secondary-container py-1 pl-3 pr-1 text-label-lg text-on-secondary-container"
            >
              {c.text}
              <button
                type="button"
                aria-label={`Bỏ lọc ${c.text}`}
                onClick={c.onClear}
                className="inline-flex size-6 items-center justify-center rounded-full hover:bg-on-secondary-container/10"
              >
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="px-2 text-label-lg font-semibold text-primary hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-[1.5rem] p-space-lg">
          <div className="mx-auto h-1 w-10 rounded-full bg-outline-variant" />
          <div className="flex items-center justify-between">
            <SheetTitle className="text-headline-sm text-on-surface">Lọc sách</SheetTitle>
            <button
              type="button"
              onClick={onReset}
              className="text-label-lg font-semibold text-primary"
            >
              Xóa bộ lọc
            </button>
          </div>
          <div className="flex flex-col gap-space-sm">{selects(true)}</div>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="h-12 rounded-full bg-primary text-label-lg font-semibold text-on-primary"
          >
            Xem kết quả
          </button>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon = "expand_more",
  full,
  highlighted,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: string;
  full?: boolean;
  highlighted?: boolean;
}) {
  return (
    <label className={cn("relative", full ? "block w-full" : "shrink-0")}>
      <span className={full ? "mb-1 block text-label-md text-on-surface-variant" : "sr-only"}>
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 cursor-pointer appearance-none rounded-full bg-surface-container-lowest pl-space-md pr-10 text-body-md text-on-surface shadow-pod outline-none transition-colors hover:bg-surface-container-low",
            full && "w-full bg-surface-container-low shadow-none",
            highlighted && "ring-2 ring-primary/30",
          )}
        >
          {options.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <MaterialIcon
          name={icon}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant"
        />
      </span>
    </label>
  );
}
