"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "../inventory/types";

type Category = components["schemas"]["CategoryRead"];

const CONDITION_OPTIONS = [
  { value: "", label: "Tình trạng sách (Tất cả)" },
  { value: "mint", label: "Rất mới (≥95%)" },
  { value: "good", label: "Tốt (80-94%)" },
  { value: "fair", label: "Khá (60-79%)" },
  { value: "vintage", label: "Sách xưa / Hiếm (<60%)" },
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
  filteredCount,
  total,
  viewMode,
  onViewModeChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  categorySlug: string;
  onCategoryChange: (slug: string) => void;
  conditionKey: string;
  onConditionChange: (key: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  categories: Category[];
  filteredCount: number;
  total: number;
  viewMode: "table" | "grid";
  onViewModeChange: (m: "table" | "grid") => void;
}) {
  return (
    <div className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(27,77,62,0.04)]">
      <div className="flex flex-col items-center gap-space-md lg:flex-row">
        <div className="relative w-full flex-1">
          <MaterialIcon
            name="search"
            className="absolute left-space-md top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
          />
          <input
            type="search"
            aria-label="Tìm sách trong kho"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên tác phẩm, tác giả, mã lưu kho (MS-...), ISBN, vị trí kệ..."
            className="w-full rounded-full bg-surface-container-low py-2.5 pl-11 pr-24 text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:bg-surface-container focus:ring-1 focus:ring-primary/20"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-on-surface-variant">
            <MaterialIcon name="barcode_scanner" className="text-[18px]" />
            <span className="rounded bg-surface-container-highest px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
              F2
            </span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-space-xs lg:w-auto">
          <FilterSelect
            ariaLabel="Thể loại"
            value={categorySlug}
            onChange={onCategoryChange}
            options={[
              { value: "", label: `Tất cả thể loại (${categories.length} mục)` },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <FilterSelect
            ariaLabel="Tình trạng"
            value={conditionKey}
            onChange={onConditionChange}
            options={CONDITION_OPTIONS}
          />
          <FilterSelect
            ariaLabel="Sắp xếp"
            value={sort}
            onChange={onSortChange}
            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            icon="swap_vert"
          />
          <div className="ml-auto flex items-center rounded-full bg-surface-container-low p-1 lg:ml-0">
            <ViewToggle active={viewMode === "table"} onClick={() => onViewModeChange("table")} icon="format_list_bulleted" title="Xem dạng bảng" />
            <ViewToggle active={viewMode === "grid"} onClick={() => onViewModeChange("grid")} icon="grid_view" title="Xem dạng lưới (sắp có)" disabled />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-xs pt-1">
        <span className="mr-1 text-label-sm text-on-surface-variant">Bộ lọc đang bật:</span>
        {conditionKey || categorySlug || search.trim() ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/60 px-3 py-1 text-label-sm font-medium text-on-secondary-container">
            Đang lọc
          </span>
        ) : (
          <span className="text-body-sm text-on-surface-variant">Không có</span>
        )}
        <span className="ml-auto text-body-sm text-on-surface-variant">
          Đang hiển thị <strong>{filteredCount}</strong> / {total} ấn bản
        </span>
      </div>
    </div>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  onChange,
  options,
  icon = "expand_more",
}: {
  ariaLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-full bg-surface-container-low py-2.5 pl-space-md pr-8 text-label-md text-on-surface outline-none transition-all hover:bg-surface-container"
      >
        {options.map((o) => (
          <option key={o.value || "all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <MaterialIcon
        name={icon}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant"
      />
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  icon,
  title,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full p-1.5 transition-colors",
        active
          ? "bg-surface-container-lowest text-primary shadow-sm"
          : "text-on-surface-variant hover:text-on-surface",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <MaterialIcon name={icon} className="text-[18px]" />
    </button>
  );
}
