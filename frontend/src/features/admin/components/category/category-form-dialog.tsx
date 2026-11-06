"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { hasCode } from "@/lib/api/errors";
import { errorMessage } from "@/lib/error-messages";
import { applyServerErrors } from "@/lib/forms";
import { toast } from "@/lib/toast";
import { categorySchema, type CategoryForm } from "@/lib/validation/category";
import {
  type CategoryRead as Category,
  useSaveCategory,
} from "../../hooks/use-admin";

type Props = {
  /** `"new"` to create, a category to edit, `null` when closed. */
  category: Category | "new" | null;
  onClose: () => void;
};

/** Add / edit category dialog. */
export function CategoryFormDialog({ category, onClose }: Props) {
  const save = useSaveCategory();
  const isNew = category === "new";

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const { reset: resetForm } = form;
  const { reset: resetSave } = save;
  useEffect(() => {
    if (category === null) return;
    resetSave();
    resetForm({ name: category === "new" ? "" : category.name });
  }, [category, resetForm, resetSave]);

  const onSubmit = form.handleSubmit((v) => {
    if (!category) return;
    save.mutate(
      { id: category === "new" ? undefined : category.id, name: v.name },
      {
        onSuccess: () => {
          toast.success(isNew ? "Đã tạo thể loại" : "Đã lưu thể loại");
          onClose();
        },
        onError: (e) => {
          if (hasCode(e, "CATEGORY_EXISTS")) {
            form.setError("name", { type: "server", message: errorMessage(e) });
            return;
          }
          if (!applyServerErrors(e, form.setError)) toast.error(errorMessage(e));
        },
      },
    );
  });

  return (
    <Dialog open={category !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col gap-10 px-6 py-8 sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary text-center">
            {isNew ? "Thêm thể loại" : "Chỉnh sửa thể loại"}
          </DialogTitle>
        </DialogHeader>
        <form noValidate className="grid gap-4" onSubmit={onSubmit}>
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
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
  );
}
