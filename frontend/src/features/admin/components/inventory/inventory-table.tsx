"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { conditionLabel, formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminInventoryRow } from "../../inventory/types";
import { InventoryAuthors, InventoryBookCover } from "./inventory-book-cover";
import { RowMenu, StockMeta, StockStepper, VisibilitySwitch } from "./inventory-row-controls";

const HEAD = "h-12 px-4 text-[14px] font-semibold text-on-primary";
const CELL = "px-4 py-3 align-top";

/** Desktop (≥ md) book list. Loading, error and empty blocks are rendered by the page. */
export function InventoryTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  isLoading,
  onDelete,
  onAuthorClick,
}: {
  rows: AdminInventoryRow[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
  isLoading?: boolean;
  onDelete: (row: AdminInventoryRow) => void;
  onAuthorClick: (authorId: number) => void;
}) {
  const ids = rows.map((r) => r.id);
  const nSelected = ids.filter((id) => selectedIds.has(id)).length;
  const allChecked = nSelected > 0 && nSelected === ids.length;

  return (
    <div className="overflow-hidden rounded-serene-lg bg-surface-container-lowest shadow-pod">
      <Table>
        <TableHeader className="bg-primary">
          <TableRow className="border-0 hover:bg-primary">
            <TableHead className={cn(HEAD, "w-12")}>
              <Checkbox
                aria-label="Chọn tất cả sách trong trang"
                checked={allChecked}
                indeterminate={nSelected > 0 && !allChecked}
                disabled={isLoading || !rows.length}
                onCheckedChange={() => onToggleAll(ids)}
                className="border-on-primary/70 data-checked:border-on-primary data-checked:bg-on-primary data-checked:text-primary data-indeterminate:bg-on-primary data-indeterminate:text-primary"
              />
            </TableHead>
            <TableHead className={cn(HEAD, "min-w-72")}>Sách</TableHead>
            <TableHead className={HEAD}>Thể loại</TableHead>
            <TableHead className={HEAD}>Tình trạng</TableHead>
            <TableHead className={cn(HEAD, "text-right")}>Giá bán</TableHead>
            <TableHead className={HEAD}>Tồn kho</TableHead>
            <TableHead className={HEAD}>Hiển thị</TableHead>
            <TableHead className={cn(HEAD, "w-12")}>
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
            : rows.map((row) => {
                const selected = selectedIds.has(row.id);
                const dim = !row.isVisible && "opacity-60";
                return (
                  <TableRow
                    key={row.id}
                    data-state={selected ? "selected" : undefined}
                    className={cn(
                      "border-outline-variant/30",
                      selected ? "bg-secondary-container/20" : "hover:bg-surface-container-low",
                    )}
                  >
                    <TableCell className={CELL}>
                      <Checkbox
                        aria-label={`Chọn ${row.title}`}
                        checked={selected}
                        onCheckedChange={() => onToggleRow(row.id)}
                        className="mt-1"
                      />
                    </TableCell>
                    <TableCell className={CELL}>
                      <div className={cn("flex items-start gap-3", dim)}>
                        <InventoryBookCover row={row} className="h-14 w-10" sizes="40px" />
                        <div className="min-w-0 pt-1">
                          <Link
                            href={`/admin/books/${row.id}`}
                            className="line-clamp-2 text-body-lg font-medium text-on-surface hover:text-primary"
                          >
                            {row.title}
                          </Link>
                          <div className="mt-0.5 text-body-sm text-on-surface-variant">
                            <InventoryAuthors row={row} onAuthorClick={onAuthorClick} />
                            {" · "}
                            <span className="font-mono text-[12px]">{row.stockCode}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn(CELL, "pt-4 text-on-surface-variant", dim)}>
                      {row.categoryName}
                    </TableCell>
                    <TableCell className={cn(CELL, "pt-4", dim)}>
                      <span
                        title={conditionLabel(row.conditionPct)}
                        className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm font-semibold tabular-nums text-on-surface"
                      >
                        {row.conditionPct}%
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        CELL,
                        "pt-4 text-right font-semibold tabular-nums text-on-surface",
                        dim,
                      )}
                    >
                      {formatVnd(row.salePrice)}
                    </TableCell>
                    <TableCell className={CELL}>
                      <div className="flex flex-col items-start gap-1">
                        <StockStepper row={row} />
                        <StockMeta row={row} />
                      </div>
                    </TableCell>
                    <TableCell className={cn(CELL, "pt-4")}>
                      <VisibilitySwitch row={row} />
                    </TableCell>
                    <TableCell className={cn(CELL, "pt-3")}>
                      <RowMenu row={row} onDelete={onDelete} />
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow className="border-outline-variant/30 hover:bg-transparent">
      <TableCell className={CELL}>
        <Skeleton className="size-4 rounded" />
      </TableCell>
      <TableCell className={CELL}>
        <div className="flex gap-3">
          <Skeleton className="h-14 w-10 rounded-[6px]" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </TableCell>
      <TableCell className={CELL}>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell className={CELL}>
        <Skeleton className="h-5 w-10 rounded-full" />
      </TableCell>
      <TableCell className={CELL}>
        <Skeleton className="ml-auto h-3.5 w-16" />
      </TableCell>
      <TableCell className={CELL}>
        <Skeleton className="h-7 w-24 rounded-full" />
      </TableCell>
      <TableCell className={CELL}>
        <Skeleton className="h-6 w-11 rounded-full" />
      </TableCell>
      <TableCell className={CELL} />
    </TableRow>
  );
}
