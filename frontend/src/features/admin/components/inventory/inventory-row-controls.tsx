"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useToggleVisible } from "../../hooks/use-admin";
import { useQuantityDraft } from "../../hooks/use-quantity-draft";
import type { AdminInventoryRow } from "../../inventory/types";

type Size = "sm" | "lg";

function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-label="Đang lưu"
      className={cn(
        "inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

/** −/number/+ stock editor. Click the number to type a value (Enter saves, Esc cancels). */
export function StockStepper({ row, size = "sm" }: { row: AdminInventoryRow; size?: Size }) {
  const { value, setValue, step, saving } = useQuantityDraft(row.id, row.quantity);
  const [editing, setEditing] = useState(false);
  const btn = size === "lg" ? "size-11" : "size-7";
  const numH = size === "lg" ? "h-9" : "h-7";

  const commit = (raw: string) => {
    setEditing(false);
    const v = Number.parseInt(raw, 10);
    if (Number.isNaN(v) || v < 0) return;
    setValue(v, true);
  };

  return (
    <div className="inline-flex items-center rounded-full bg-surface-container-low">
      <button
        type="button"
        disabled={value === 0}
        onClick={() => step(-1)}
        aria-label={`Giảm số lượng ${row.title}`}
        className={cn(
          btn,
          "grid place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent",
        )}
      >
        <MaterialIcon name="remove" className="text-[16px]" />
      </button>
      {editing ? (
        <input
          type="number"
          min={0}
          inputMode="numeric"
          autoFocus
          defaultValue={value}
          aria-label={`Số lượng ${row.title}`}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(e.currentTarget.value);
            } else if (e.key === "Escape") {
              setEditing(false);
            }
          }}
          className={cn(
            numH,
            "w-12 rounded-md bg-surface-container-lowest text-center text-label-lg tabular-nums outline-none ring-2 ring-primary/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          )}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          title={value === 0 ? "Đặt 0 khi sách đã bán hết" : "Bấm để nhập số"}
          aria-label={`Số lượng ${row.title}: ${value}. Bấm để nhập`}
          className={cn(
            numH,
            "min-w-8 rounded-md px-1 text-center text-label-lg font-semibold tabular-nums hover:bg-surface-container",
            value === 0 ? "text-destructive" : "text-on-surface",
          )}
        >
          {value}
        </button>
      )}
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={`Tăng số lượng ${row.title}`}
        className={cn(
          btn,
          "grid place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container",
        )}
      >
        {saving ? <Spinner /> : <MaterialIcon name="add" className="text-[16px]" />}
      </button>
    </div>
  );
}

/** "Còn hàng"/"Hết hàng" pill, plus "n chờ xác nhận" when copies sit in pending orders. */
export function StockMeta({ row }: { row: AdminInventoryRow }) {
  const inStock = row.quantity > 0;
  return (
    <div className="flex flex-wrap gap-1">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-label-sm",
          inStock
            ? "bg-secondary-container/70 text-on-secondary-container"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        {inStock ? "Còn hàng" : "Hết hàng"}
      </span>
      {row.pending > 0 && (
        <span
          title="Đang nằm trong đơn chưa xác nhận, khách khác không mua được"
          className="rounded-full bg-pod-honey px-2 py-0.5 text-label-sm text-tertiary"
        >
          {row.pending} chờ xác nhận
        </span>
      )}
    </div>
  );
}

/** Show/hide on the shop; optimistic, toasts the result. */
export function VisibilitySwitch({ row, size = "sm" }: { row: AdminInventoryRow; size?: Size }) {
  const toggle = useToggleVisible();
  const saving = toggle.isPending;
  const on = row.isVisible;

  const onClick = () => {
    if (saving) return;
    const visible = !on;
    toggle.mutate(
      { id: row.id, visible },
      {
        onSuccess: () =>
          toast.success(visible ? `Đã hiện «${row.title}» trên shop` : `Đã ẩn «${row.title}»`),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Hiển thị ${row.title} trên shop`}
      disabled={saving}
      onClick={onClick}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors disabled:cursor-wait",
        size === "lg" ? "h-8 w-[52px]" : "h-6 w-11",
        on ? "bg-secondary" : "bg-surface-container-high",
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full bg-white text-secondary shadow transition-transform",
          size === "lg" ? "size-7" : "size-5",
          on && "translate-x-5",
        )}
      >
        {saving && <Spinner className="size-3" />}
      </span>
    </button>
  );
}

/** ⋯ menu: edit, view on shop, delete. */
export function RowMenu({
  row,
  onDelete,
  size = "sm",
}: {
  row: AdminInventoryRow;
  onDelete: (row: AdminInventoryRow) => void;
  size?: Size;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Thao tác khác cho ${row.title}`}
        className={cn(
          "grid place-items-center rounded-full text-on-surface-variant outline-none hover:bg-surface-container focus-visible:ring-3 focus-visible:ring-ring/50",
          size === "lg" ? "size-11" : "size-8",
        )}
      >
        <MaterialIcon name="more_horiz" className="text-[20px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem render={<Link href={`/admin/books/${row.id}`} />}>
          <MaterialIcon name="edit" className="text-[18px] text-on-surface-variant" />
          Sửa chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<a href={`/books/${row.slug}`} target="_blank" rel="noopener noreferrer" />}
        >
          <MaterialIcon name="open_in_new" className="text-[18px] text-on-surface-variant" />
          Xem trên shop
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(row)}>
          <MaterialIcon name="delete" className="text-[18px]" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
