"use client";

import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";
import { conditionBand, formatVnd } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { AdminInventoryRow, ShelfStatus } from "../../inventory/types";

const SHELF: Record<ShelfStatus> = {
  on_shelf: {
    label: "Còn hàng",
    className: "bg-secondary-container/70 text-on-secondary-container",
  },
  held: {
    label: "Đang giữ hàng",
    className: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
  sold: {
    label: "Hết hàng",
    className: "bg-surface-container-high text-on-surface",
  },
  hidden: {
    label: "Đang ẩn",
    className: "bg-surface-container text-on-surface-variant",
  },
};

export function InventoryTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  isLoading,
  error,
  onEdit,
  onMarkSold,
}: {
  rows: AdminInventoryRow[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
  isLoading?: boolean;
  error: unknown;
  onEdit: (id: number) => void;
  onMarkSold: (id: number) => void;
}) {
  if (isLoading) return <Skeleton className="h-96 rounded-lg" />;
  if (error) return <ErrorMessage error={error} />;
  if (!rows.length) {
    return (
      <EmptyState
        title="Chưa có sách trong kho"
        action={<LinkButton href="/admin/books/new">Thêm sách mới</LinkButton>}
      />
    );
  }

  const pageIds = rows.map((r) => r.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-[0_8px_24px_-4px_rgba(27,77,62,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-body-md">
          <thead>
            <tr className="bg-surface-container-low/70 text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={allSelected}
                  onChange={() => onToggleAll(pageIds)}
                  className="size-4 cursor-pointer accent-primary"
                />
              </th>
              <th className="px-4 py-3.5 font-semibold">Mã lưu kho</th>
              <th className="min-w-[280px] px-4 py-3.5 font-semibold">
                Sách & Tác giả
              </th>
              <th className="px-4 py-3.5 font-semibold">Thể loại</th>
              <th className="min-w-[140px] px-4 py-3.5 text-right font-semibold">
                Giá bán
              </th>
              <th className="px-4 py-3.5 text-center font-semibold">
                Trạng thái
              </th>
              <th className="w-36 px-4 py-3.5 text-right font-semibold">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="group transition-colors hover:bg-surface-container-low/40"
              >
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => onToggleRow(row.id)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-md font-semibold text-primary">
                      {row.stockCode}
                    </span>
                    <button
                      type="button"
                      title="Sao chép mã"
                      className="text-on-surface-variant opacity-0 transition-all hover:text-primary group-hover:opacity-100"
                      onClick={() => {
                        void navigator.clipboard.writeText(row.stockCode);
                        toast.success("Đã sao chép mã lưu kho");
                      }}
                    >
                      <MaterialIcon
                        name="content_copy"
                        className="text-[16px]"
                      />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-surface-container shadow-sm">
                      {row.coverUrl ? (
                        <Image
                          src={row.coverUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/books/${row.id}`}
                        className="block truncate text-headline-sm font-semibold text-on-surface transition-colors group-hover:text-primary"
                      >
                        {row.title}
                      </Link>
                      <p className="text-body-sm text-on-surface-variant">
                        Tác giả:{" "}
                        <span className="font-medium text-on-surface">
                          {row.author ?? "—"}
                        </span>
                      </p>
                      {(row.publishedYear || row.publisher) && (
                        <p className="mt-0.5 text-label-sm text-on-surface-variant">
                          {row.publishedYear
                            ? `Bản in ${row.publishedYear}`
                            : null}
                          {row.publishedYear && row.publisher ? " • " : null}
                          {row.publisher}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-flex rounded-full bg-tertiary-fixed/60 px-2.5 py-1 text-label-sm font-semibold text-tertiary">
                    {row.categoryName}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <div className="text-headline-sm font-bold text-primary">
                    {formatVnd(row.salePrice)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
                      SHELF[row.shelfStatus].className,
                    )}
                  >
                    {SHELF[row.shelfStatus].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn
                      title="Chỉnh sửa"
                      icon="edit"
                      onClick={() => onEdit(row.id)}
                    />
                    <IconBtn
                      title="Xuất bán"
                      icon="shopping_cart_checkout"
                      onClick={() => onMarkSold(row.id)}
                      className="hover:bg-secondary-container hover:text-on-secondary-container"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  className,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container hover:text-primary",
        className,
      )}
    >
      <MaterialIcon name={icon} className="text-[18px]" />
    </button>
  );
}
