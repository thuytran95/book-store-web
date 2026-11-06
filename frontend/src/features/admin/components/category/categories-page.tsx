"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type CategoryRead as Category,
  useAdminCategories,
} from "../../hooks/use-admin";
import { linkButtonVariants } from "@/components/shared/link-button";
import { TablePagination } from "@/components/shared/table-pagination";
import { useClientPagination } from "@/lib/use-pagination";
import { CategoryDeleteDialog } from "./category-delete-dialog";
import { CategoryFormDialog } from "./category-form-dialog";

const PAGE_SIZE = 10;

/** Icon-only button for table row actions: no background, the icon carries the colour. */
const ICON_BUTTON =
  "inline-flex size-8 items-center justify-center rounded-full transition-opacity outline-none hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50";

export function CategoriesPage() {
  const { data, isLoading, error } = useAdminCategories();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const { pageItems: rows, ...pagination } = useClientPagination(
    data,
    PAGE_SIZE,
  );

  return (
    <div className="grid gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-sm">
            <MaterialIcon name="account_tree" className="text-[26px]" />
          </div>
          <h1 className="text-headline-lg tracking-tight text-primary">
            Thể loại sách
          </h1>
        </div>
      </div>

      <section className="w-full overflow-hidden rounded-serene-lg bg-surface-container-lowest shadow-[0_8px_30px_-6px_rgba(27,77,62,0.06),0_2px_8px_-2px_rgba(0,0,0,0.04)]">
        <div className="p-space-xl flex flex-col gap-4">
          <button
            type="button"
            className={cn(linkButtonVariants(), "ml-auto")}
            onClick={() => setEditing("new")}
          >
            + Thêm thể loại
          </button>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : !data?.length ? (
            <EmptyState title="Chưa có thể loại" />
          ) : (
            <div className="overflow-hidden rounded-serene">
              <Table>
                <TableHeader className="bg-primary">
                  <TableRow className="border-0 hover:bg-primary">
                    <TableHead className="h-12 px-4 text-[14px] font-semibold text-on-primary">
                      Tên
                    </TableHead>
                    <TableHead className="h-12 px-4 text-[14px] font-semibold text-on-primary">
                      Slug
                    </TableHead>
                    <TableHead className="h-12 px-4 text-[14px] font-semibold text-on-primary">
                      Số sách
                    </TableHead>
                    <TableHead className="h-12 px-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-outline-variant/30 hover:bg-surface-container-low"
                    >
                      <TableCell className="px-4 py-3 font-medium text-on-surface">
                        {c.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-on-surface-variant">
                        {c.slug}
                      </TableCell>
                      <TableCell className="px-4 py-3 tabular-nums">
                        {c.book_count ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            aria-label={`Sửa thể loại ${c.name}`}
                            title="Sửa"
                            onClick={() => setEditing(c)}
                            className={cn(
                              ICON_BUTTON,
                              "text-primary cursor-pointer",
                            )}
                          >
                            <MaterialIcon
                              name="edit"
                              filled
                              className="text-[16px]"
                            />
                          </button>
                          <button
                            title="Xoá"
                            onClick={() => setDeleting(c)}
                            className={cn(
                              ICON_BUTTON,
                              "text-destructive cursor-pointer",
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
          )}
        </div>
      </section>
      <TablePagination {...pagination} itemLabel="thể loại" />

      <CategoryFormDialog
        category={editing}
        onClose={() => setEditing(null)}
      />
      <CategoryDeleteDialog
        category={deleting}
        categories={data ?? []}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
