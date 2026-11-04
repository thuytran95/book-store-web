"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { BookQuery, BookSort } from "@/lib/book-query";
import type { components } from "@/lib/api/schema";
import { formatVnd } from "@/lib/format";

type Category = components["schemas"]["CategoryRead"];

type Props = {
  categories: Category[];
  value: BookQuery;
  onChange: (patch: Partial<BookQuery>) => void;
  onClear?: () => void;
};

const CONDITIONS = [
  { value: 90, label: "Từ 90% (như mới)" },
  { value: 80, label: "Từ 80%" },
  { value: 70, label: "Từ 70%" },
  { value: 50, label: "Từ 50%" },
];

const SORTS: { value: BookSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "relevance", label: "Liên quan nhất" },
];

const toNum = (v: string) => (v === "" ? undefined : Number(v));

function Fields({ categories, value, onChange }: Props) {
  return (
    <div className="grid gap-4">
      <FormField label="Danh mục">
        <NativeSelect
          value={value.category ?? ""}
          onChange={(e) => onChange({ category: e.target.value || undefined })}
        >
          <option value="">Tất cả</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <div className="grid grid-cols-2 gap-2">
        <FormField label="Giá từ (đ)">
          <Input
            type="number"
            min={0}
            step={1000}
            defaultValue={value.price_min ?? ""}
            key={`min-${value.price_min ?? ""}`}
            onBlur={(e) => onChange({ price_min: toNum(e.target.value) })}
          />
        </FormField>
        <FormField label="Đến (đ)">
          <Input
            type="number"
            min={0}
            step={1000}
            defaultValue={value.price_max ?? ""}
            key={`max-${value.price_max ?? ""}`}
            onBlur={(e) => onChange({ price_max: toNum(e.target.value) })}
          />
        </FormField>
      </div>

      <FormField label="Tình trạng tối thiểu">
        <NativeSelect
          value={value.condition_min ?? ""}
          onChange={(e) => onChange({ condition_min: toNum(e.target.value) })}
        >
          <option value="">Bất kỳ</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <FormField label="Sắp xếp">
        <NativeSelect
          value={value.sort ?? "newest"}
          onChange={(e) => onChange({ sort: e.target.value as BookSort })}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={Boolean(value.in_stock)}
          onCheckedChange={(c) => onChange({ in_stock: c ? true : undefined })}
        />
        <Label htmlFor="in-stock">Chỉ sách còn hàng</Label>
      </div>
    </div>
  );
}

function activeChips(value: BookQuery, categories: Category[]) {
  const chips: { key: string; label: string; clear: Partial<BookQuery> }[] = [];
  if (value.category) {
    const name = categories.find((c) => c.slug === value.category)?.name ?? value.category;
    chips.push({ key: "category", label: name, clear: { category: undefined } });
  }
  if (value.price_min !== undefined)
    chips.push({ key: "pmin", label: `≥ ${formatVnd(value.price_min)}`, clear: { price_min: undefined } });
  if (value.price_max !== undefined)
    chips.push({ key: "pmax", label: `≤ ${formatVnd(value.price_max)}`, clear: { price_max: undefined } });
  if (value.condition_min !== undefined)
    chips.push({ key: "cond", label: `Tình trạng ≥ ${value.condition_min}%`, clear: { condition_min: undefined } });
  if (value.in_stock) chips.push({ key: "stock", label: "Còn hàng", clear: { in_stock: undefined } });
  if (value.text) chips.push({ key: "text", label: `"${value.text}"`, clear: { text: undefined } });
  return chips;
}

/** Desktop: sidebar. Mobile: button opening a Sheet. State lives in the URL (see `useBookQuery`). */
export function BookFilters(props: Props) {
  const [open, setOpen] = useState(false);
  const chips = activeChips(props.value, props.categories);

  const clearAll = (
    <Button variant="ghost" size="sm" onClick={props.onClear} disabled={chips.length === 0}>
      Xoá bộ lọc
    </Button>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 md:block" aria-label="Bộ lọc">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Bộ lọc</h2>
          {clearAll}
        </div>
        <Fields {...props} />
      </aside>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" />}>
            <SlidersHorizontal /> Bộ lọc{chips.length > 0 && ` (${chips.length})`}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto p-4">
            <SheetTitle>Bộ lọc</SheetTitle>
            <Fields {...props} />
            <div className="flex gap-2">
              {clearAll}
              <Button className="ml-auto" onClick={() => setOpen(false)}>
                Xem kết quả
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Bộ lọc đang áp dụng">
          {chips.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => props.onChange(c.clear)}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-muted/70"
                aria-label={`Bỏ lọc ${c.label}`}
              >
                {c.label} <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
