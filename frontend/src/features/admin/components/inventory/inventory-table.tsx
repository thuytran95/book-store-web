"use client";

import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminInventoryRow, ShelfStatus } from "../../inventory/types";

const SHELF: Record<ShelfStatus, { label: string; className: string }> = {
  on_shelf: {
    label: "Còn hàng",
    className: "bg-secondary-container/70 text-on-secondary-container",
  },
  held: {
    label: "Chờ xác nhận đơn",
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

const HEAD = "h-12 px-4 text-[14px] font-semibold text-on-primary";

/** Icon-only button for table row actions: no background, the icon carries the colour. */
const ICON_BUTTON =
  "inline-flex size-8 items-center justify-center rounded-full transition-opacity outline-none hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50";

export function InventoryTable({
  rows,
  isLoading,
  error,
  onEdit,
  onDelete,
}: {
  rows: AdminInventoryRow[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
  isLoading?: boolean;
  error: unknown;
  onEdit: (id: number) => void;
  onDelete: (row: AdminInventoryRow) => void;
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

  return (
    <div className="overflow-hidden rounded-serene">
      <Table>
        <TableHeader className="bg-primary">
          <TableRow className="border-0 hover:bg-primary">
            <TableHead className={HEAD}>Mã sách</TableHead>
            <TableHead className={cn(HEAD, "min-w-70")}>Sách</TableHead>
            <TableHead className={HEAD}>Thể loại</TableHead>
            <TableHead className={cn(HEAD, "min-w-[140px] text-right")}>
              Giá bán
            </TableHead>
            <TableHead className={cn(HEAD, "text-center")}>
              Trạng thái
            </TableHead>
            <TableHead className="h-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-outline-variant/30 hover:bg-surface-container-low"
            >
              <TableCell className="px-4 py-3 font-medium text-primary">
                {row.stockCode}
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-container">
                    {row.coverUrl ? (
                      <Image
                        src={row.coverUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : null}
                  </div>
                  <Link
                    href={`/admin/books/${row.id}`}
                    className="min-w-0 truncate font-medium text-on-surface hover:text-primary"
                  >
                    {row.title}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-on-surface-variant">
                {row.categoryName}
              </TableCell>
              <TableCell className="px-4 py-3 text-right tabular-nums font-medium text-on-surface">
                {formatVnd(row.salePrice)}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs",
                    SHELF[row.shelfStatus].className,
                  )}
                >
                  {SHELF[row.shelfStatus].label}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    aria-label={`Sửa sách ${row.title}`}
                    title="Sửa"
                    onClick={() => onEdit(row.id)}
                    className={cn(ICON_BUTTON, "cursor-pointer text-primary")}
                  >
                    <MaterialIcon name="edit" filled className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Xoá sách ${row.title}`}
                    title="Xoá"
                    onClick={() => onDelete(row)}
                    className={cn(
                      ICON_BUTTON,
                      "cursor-pointer text-destructive",
                    )}
                  >
                    <MaterialIcon
                      name="delete"
                      filled
                      className="text-[16px]"
                    />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
