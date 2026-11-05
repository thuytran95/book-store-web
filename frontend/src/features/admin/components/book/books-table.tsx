"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { errorMessage } from "@/lib/error-messages";
import { formatVnd } from "@/lib/format";
import { toast } from "@/lib/toast";
import {
  useAdminBooks,
  useAdminCategories,
  useDeleteBook,
  useMarkSold,
  useToggleVisible,
  type AdminBookFilters,
} from "../../hooks/use-admin";
import { LinkButton } from "@/components/shared/link-button";

type Target = { id: number; title: string; kind: "delete" | "sold" };

export function BooksTable() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState<"all" | "yes" | "no">("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Target | null>(null);

  const filters: AdminBookFilters = useMemo(
    () => ({
      text: text.trim() || undefined,
      category: category || undefined,
      visible: visible === "all" ? undefined : visible === "yes",
      page,
      size: 20,
    }),
    [text, category, visible, page],
  );

  const { data: categories = [] } = useAdminCategories();
  const { data, isLoading, error } = useAdminBooks(filters);
  const toggle = useToggleVisible();
  const sold = useMarkSold();
  const remove = useDeleteBook();
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Sách</h1>
        <LinkButton href="/admin/books/new">Thêm sách</LinkButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          type="search"
          aria-label="Tìm sách"
          placeholder="Tên, tác giả…"
          className="max-w-xs"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPage(1);
          }}
        />
        <NativeSelect
          aria-label="Thể loại"
          className="w-48"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả thể loại</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Hiển thị"
          className="w-40"
          value={visible}
          onChange={(e) => {
            setVisible(e.target.value as typeof visible);
            setPage(1);
          }}
        >
          <option value="all">Tất cả</option>
          <option value="yes">Đang hiện</option>
          <option value="no">Đang ẩn</option>
        </NativeSelect>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : !data?.items.length ? (
        <EmptyState title="Không có sách" action={<LinkButton href="/admin/books/new">Thêm sách</LinkButton>} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sách</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Link href={`/admin/books/${b.id}`} className="font-medium hover:underline">
                    {b.title}
                  </Link>
                  {b.author && <p className="text-xs text-muted-foreground">{b.author}</p>}
                </TableCell>
                <TableCell>{b.category.name}</TableCell>
                <TableCell className="tabular-nums">{formatVnd(b.sale_price)}</TableCell>
                <TableCell className="tabular-nums">{b.quantity}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {!b.is_visible && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Ẩn</span>
                    )}
                    {b.quantity === 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Hết hàng</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-1">
                    <LinkButton href={`/admin/books/${b.id}`} size="sm" variant="outline">
                      Sửa
                    </LinkButton>
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={toggle.isPending}
                      onClick={() =>
                        toggle.mutate(
                          { id: b.id, visible: !b.is_visible },
                          { onSuccess: () => toast.success(b.is_visible ? "Đã ẩn sách" : "Đã hiện sách") },
                        )
                      }
                    >
                      {b.is_visible ? "Ẩn" : "Hiện"}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={b.quantity === 0}
                      onClick={() => setTarget({ id: b.id, title: b.title, kind: "sold" })}
                    >
                      Đánh dấu bán
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => setTarget({ id: b.id, title: b.title, kind: "delete" })}
                    >
                      Xoá
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title={target?.kind === "sold" ? "Đánh dấu đã bán?" : "Xoá sách?"}
        message={
          target?.kind === "sold"
            ? `“${target.title}” sẽ được đặt số lượng = 0.`
            : `“${target?.title}” sẽ bị xoá, hoặc ẩn nếu đã có lịch sử đơn.`
        }
        destructive={target?.kind === "delete"}
        confirmLabel={target?.kind === "sold" ? "Đánh dấu bán" : "Xoá"}
        loading={sold.isPending || remove.isPending}
        onConfirm={() => {
          if (!target) return;
          if (target.kind === "sold") {
            sold.mutate(target.id, {
              onSuccess: () => {
                toast.success("Đã đánh dấu hết hàng");
                setTarget(null);
              },
              onError: (e) => toast.error(errorMessage(e)),
            });
          } else {
            remove.mutate(target.id, {
              onSuccess: (r) => {
                toast.success(r.hidden ? "Sách có lịch sử — đã ẩn thay vì xoá" : "Đã xoá sách");
                setTarget(null);
              },
              onError: (e) => toast.error(errorMessage(e)),
            });
          }
        }}
      />
    </div>
  );
}
