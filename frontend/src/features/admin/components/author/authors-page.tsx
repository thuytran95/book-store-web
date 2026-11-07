"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { linkButtonVariants } from "@/components/shared/link-button";
import { TablePagination } from "@/components/shared/table-pagination";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { formatDate } from "@/lib/format";
import { getPageInfo } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import {
  type AuthorRead,
  useAdminAuthors,
  useDebouncedValue,
} from "../../hooks/use-admin";
import { AuthorDeleteDialog } from "./author-delete-dialog";
import { AuthorFormDialog } from "./author-form-dialog";

const PAGE_SIZE = 10;

/** Icon-only button for table row actions: no background, the icon carries the colour. */
const ICON_BUTTON =
  "inline-flex size-8 items-center justify-center rounded-full transition-opacity outline-none hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50";

const HEAD = "h-12 px-4 text-[14px] font-semibold text-on-primary";

export function AuthorsPage() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim(), 300);
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminAuthors({ q, page, size: PAGE_SIZE });
  const [editing, setEditing] = useState<AuthorRead | "new" | null>(null);
  const [deleting, setDeleting] = useState<AuthorRead | null>(null);

  const info = getPageInfo(page, PAGE_SIZE, data?.total ?? 0);
  // New search → back to page 1; list shrank (delete) → stay on a valid page.
  useEffect(() => setPage(1), [q]);
  useEffect(() => {
    if (data && page > info.pageCount) setPage(info.pageCount);
  }, [data, page, info.pageCount]);

  const rows = data?.items ?? [];

  return (
    <div className="grid gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-sm">
            <MaterialIcon name="history_edu" className="text-[26px]" />
          </div>
          <h1 className="text-headline-lg tracking-tight text-primary">Tác giả</h1>
        </div>
      </div>

      <section className="w-full overflow-hidden rounded-serene-lg bg-surface-container-lowest shadow-[0_8px_30px_-6px_rgba(27,77,62,0.06),0_2px_8px_-2px_rgba(0,0,0,0.04)]">
        <div className="p-space-xl flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              type="search"
              className="max-w-sm"
              placeholder="Tìm tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={cn(linkButtonVariants(), "ml-auto")}
              onClick={() => setEditing("new")}
            >
              + Thêm tác giả
            </button>
          </div>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : rows.length === 0 ? (
            <EmptyState title={q ? "Không tìm thấy tác giả" : "Chưa có tác giả nào"} />
          ) : (
            <div className="overflow-hidden rounded-serene">
              <Table>
                <TableHeader className="bg-primary">
                  <TableRow className="border-0 hover:bg-primary">
                    <TableHead className={HEAD}>Tên tác giả</TableHead>
                    <TableHead className={HEAD}>Số sách</TableHead>
                    <TableHead className={HEAD}>Ngày tạo</TableHead>
                    <TableHead className="h-12 px-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow
                      key={a.id}
                      className="border-outline-variant/30 hover:bg-surface-container-low"
                    >
                      <TableCell className="px-4 py-3 font-medium text-on-surface">
                        {a.name}
                        {a.bio && (
                          <p className="line-clamp-1 max-w-md text-xs font-normal text-on-surface-variant">
                            {a.bio}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 tabular-nums">
                        {a.book_count ? (
                          <Link
                            href={`/admin?author_id=${a.id}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {a.book_count} sách
                          </Link>
                        ) : (
                          <span className="text-on-surface-variant">0</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-on-surface-variant">
                        {formatDate(a.created_at, false)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            aria-label={`Sửa tác giả ${a.name}`}
                            title="Sửa"
                            onClick={() => setEditing(a)}
                            className={cn(ICON_BUTTON, "text-primary cursor-pointer")}
                          >
                            <MaterialIcon name="edit" filled className="text-[16px]" />
                          </button>
                          <button
                            aria-label={`Xoá tác giả ${a.name}`}
                            title="Xoá"
                            onClick={() => setDeleting(a)}
                            className={cn(ICON_BUTTON, "text-destructive cursor-pointer")}
                          >
                            <MaterialIcon name="delete" filled className="text-[16px]" />
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
      <TablePagination {...info} setPage={setPage} itemLabel="tác giả" />

      <AuthorFormDialog author={editing} onClose={() => setEditing(null)} />
      <AuthorDeleteDialog author={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
