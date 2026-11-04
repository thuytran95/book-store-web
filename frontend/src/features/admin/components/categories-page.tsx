"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, hasCode } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { categorySchema, type CategoryForm } from "@/lib/validation/category";
import { useAdminCategories, useDeleteCategory, useSaveCategory } from "../hooks/use-admin";

type Category = { id: number; name: string; slug: string; book_count?: number };

export function CategoriesPage() {
  const { data, isLoading, error } = useAdminCategories();
  const save = useSaveCategory();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [moveTo, setMoveTo] = useState<number | "">("");
  const [needMove, setNeedMove] = useState(false);

  const form = useForm<CategoryForm>({ resolver: zodResolver(categorySchema), defaultValues: { name: "" } });

  const openEdit = (c: Category | "new") => {
    setEditing(c);
    form.reset({ name: c === "new" ? "" : c.name });
  };

  const others = (data ?? []).filter((c) => c.id !== deleting?.id);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <Button onClick={() => openEdit("new")}>Thêm danh mục</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : !data?.length ? (
        <EmptyState title="Chưa có danh mục" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Số sách</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="tabular-nums">{c.book_count ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="outline" onClick={() => openEdit(c)}>
                    Sửa
                  </Button>{" "}
                  <Button size="xs" variant="destructive" onClick={() => { setDeleting(c); setNeedMove(false); setMoveTo(""); }}>
                    Xoá
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Danh mục mới" : "Sửa danh mục"}</DialogTitle>
          </DialogHeader>
          <form
            noValidate
            className="grid gap-3"
            onSubmit={form.handleSubmit((v) =>
              save.mutate(
                { id: editing === "new" || editing === null ? undefined : editing.id, name: v.name },
                {
                  onSuccess: () => {
                    toast.success("Đã lưu danh mục");
                    setEditing(null);
                  },
                  onError: (e) => applyServerErrors(e, form.setError) || toast.error(errorMessage(e)),
                },
              ),
            )}
          >
            <FormField label="Tên" required error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </FormField>
            <ErrorMessage error={save.error} />
            <Button type="submit" disabled={save.isPending}>
              Lưu
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null && !needMove}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Xoá danh mục “${deleting?.name}”?`}
        message="Nếu còn sách, bạn sẽ được yêu cầu chuyển chúng sang danh mục khác."
        destructive
        confirmLabel="Xoá"
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(
            { id: deleting.id },
            {
              onSuccess: () => {
                toast.success("Đã xoá danh mục");
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

      <Dialog open={needMove} onOpenChange={(o) => { if (!o) { setNeedMove(false); setDeleting(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển sách rồi xoá</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Danh mục vẫn còn sách
            {deleting && deleting.book_count ? ` (${deleting.book_count})` : ""}
            {hasCode(remove.error, "CATEGORY_NOT_EMPTY") && remove.error instanceof ApiError
              ? ` (${String((remove.error.details as { book_count?: number }).book_count ?? "")})`
              : ""}
            . Chọn danh mục đích.
          </p>
          <NativeSelect value={moveTo} onChange={(e) => setMoveTo(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Chọn danh mục</option>
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
                    toast.success("Đã chuyển sách và xoá danh mục");
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
