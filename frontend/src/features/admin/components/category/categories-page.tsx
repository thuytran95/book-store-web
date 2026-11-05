"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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
import { ApiError, hasCode } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { categorySchema, type CategoryForm } from "@/lib/validation/category";
import {
  type CategoryRead as Category,
  useAdminCategories,
  useDeleteCategory,
  useSaveCategory,
} from "../../hooks/use-admin";
import { linkButtonVariants } from "@/components/shared/link-button";
import { TablePagination } from "@/components/shared/table-pagination";
import { useClientPagination } from "@/lib/use-pagination";

const PAGE_SIZE = 10;

/** Icon-only button for table row actions: no background, the icon carries the colour. */
const ICON_BUTTON =
  "inline-flex size-8 items-center justify-center rounded-full transition-opacity outline-none hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50";

export function CategoriesPage() {
  const { data, isLoading, error } = useAdminCategories();
  const save = useSaveCategory();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [moveTo, setMoveTo] = useState<number | "">("");
  const [needMove, setNeedMove] = useState(false);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const openDialog = (c: Category | "new") => {
    save.reset();
    setEditing(c);
    form.reset({ name: c === "new" ? "" : c.name });
  };
  const isNew = editing === "new";

  const others = (data ?? []).filter((c) => c.id !== deleting?.id);

  const { pageItems: rows, ...pagination } = useClientPagination(data, PAGE_SIZE);

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
            onClick={() => openDialog("new")}
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
                            onClick={() => openDialog(c)}
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
                            onClick={() => {
                              setDeleting(c);
                              setNeedMove(false);
                              setMoveTo("");
                            }}
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
              <TablePagination {...pagination} itemLabel="thể loại" />
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-primary">
              {isNew ? "Thêm thể loại" : "Sửa thể loại"}
            </DialogTitle>
          </DialogHeader>
          <form
            noValidate
            className="grid gap-4"
            onSubmit={form.handleSubmit((v) => {
              if (!editing) return;
              save.mutate(
                {
                  id: editing === "new" ? undefined : editing.id,
                  name: v.name,
                },
                {
                  onSuccess: () => {
                    toast.success(
                      isNew ? "Đã tạo thể loại" : "Đã lưu thể loại",
                    );
                    setEditing(null);
                  },
                  onError: (e) => {
                    if (hasCode(e, "CATEGORY_EXISTS")) {
                      form.setError("name", {
                        type: "server",
                        message: errorMessage(e),
                      });
                      return;
                    }
                    if (!applyServerErrors(e, form.setError))
                      toast.error(errorMessage(e));
                  },
                },
              );
            })}
          >
            <FormField
              label="Tên thể loại"
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                autoFocus
                autoComplete="off"
                placeholder="Nhập tên thể loại"
                {...form.register("name")}
              />
            </FormField>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && (
                  <Loader2 className="animate-spin" aria-hidden />
                )}
                Lưu
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null && !needMove}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Xoá thể loại “${deleting?.name}”?`}
        message="Nếu còn sách, bạn sẽ được yêu cầu chuyển chúng sang thể loại khác."
        destructive
        confirmLabel="Xoá"
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(
            { id: deleting.id },
            {
              onSuccess: () => {
                toast.success("Đã xoá thể loại");
                setDeleting(null);
              },
              onError: (e) => {
                if (hasCode(e, "CATEGORY_NOT_EMPTY")) {
                  setNeedMove(true);
                  return;
                }
                toast.error(errorMessage(e));
                setDeleting(null);
              },
            },
          );
        }}
      />

      <Dialog
        open={needMove}
        onOpenChange={(o) => {
          if (!o) {
            setNeedMove(false);
            setDeleting(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển sách rồi xoá</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Thể loại vẫn còn sách
            {deleting && deleting.book_count ? ` (${deleting.book_count})` : ""}
            {hasCode(remove.error, "CATEGORY_NOT_EMPTY") &&
            remove.error instanceof ApiError
              ? ` (${String((remove.error.details as { book_count?: number }).book_count ?? "")})`
              : ""}
            . Chọn thể loại đích.
          </p>
          <NativeSelect
            value={moveTo}
            onChange={(e) =>
              setMoveTo(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Chọn thể loại</option>
            {others.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
          <Button
            disabled={moveTo === "" || remove.isPending}
            onClick={() => {
              if (!deleting || moveTo === "") return;
              remove.mutate(
                { id: deleting.id, moveTo: Number(moveTo) },
                {
                  onSuccess: () => {
                    toast.success("Đã chuyển sách và xoá thể loại");
                    setNeedMove(false);
                    setDeleting(null);
                  },
                  onError: (e) => toast.error(errorMessage(e)),
                },
              );
            }}
          >
            Chuyển và xoá
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
