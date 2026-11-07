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
import { Textarea } from "@/components/ui/textarea";
import { hasCode } from "@/lib/api/errors";
import { errorMessage } from "@/lib/error-messages";
import { applyServerErrors } from "@/lib/forms";
import { toast } from "@/lib/toast";
import { authorSchema, type AuthorForm } from "@/lib/validation/author";
import { type AuthorRead, useSaveAuthor } from "../../hooks/use-admin";

type Props = {
  /** `"new"` to create, an author to edit, `null` when closed. */
  author: AuthorRead | "new" | null;
  /** Pre-filled name when creating (e.g. from the picker search text). */
  defaultName?: string;
  onClose: () => void;
  onSaved?: (author: AuthorRead) => void;
};

/** Add / edit author dialog. */
export function AuthorFormDialog({
  author,
  defaultName = "",
  onClose,
  onSaved,
}: Props) {
  const save = useSaveAuthor();
  const isNew = author === "new";

  const form = useForm<AuthorForm>({
    resolver: zodResolver(authorSchema),
    defaultValues: { name: "", bio: "" },
  });

  const { reset: resetForm } = form;
  const { reset: resetSave } = save;
  useEffect(() => {
    if (author === null) return;
    resetSave();
    resetForm(
      author === "new"
        ? { name: defaultName, bio: "" }
        : { name: author.name, bio: author.bio ?? "" },
    );
  }, [author, defaultName, resetForm, resetSave]);

  const onSubmit = form.handleSubmit((v) => {
    if (!author) return;
    save.mutate(
      {
        id: author === "new" ? undefined : author.id,
        name: v.name,
        bio: v.bio,
      },
      {
        onSuccess: (saved) => {
          toast.success(isNew ? "Đã thêm tác giả" : "Đã lưu tác giả");
          onSaved?.(saved);
          onClose();
        },
        onError: (e) => {
          if (hasCode(e, "AUTHOR_EXISTS")) {
            form.setError("name", { type: "server", message: errorMessage(e) });
            return;
          }
          if (!applyServerErrors(e, form.setError))
            toast.error(errorMessage(e));
        },
      },
    );
  });

  return (
    <Dialog open={author !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col gap-10 px-6 py-8 sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary text-center">
            {isNew ? "Thêm tác giả" : "Sửa tác giả"}
          </DialogTitle>
        </DialogHeader>
        {/* Stop propagation: this dialog can open from inside the book form. */}
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(e) => {
            e.stopPropagation();
            void onSubmit(e);
          }}
        >
          <FormField
            label="Tên tác giả"
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              autoFocus
              autoComplete="off"
              placeholder="Nhập tên tác giả"
              {...form.register("name")}
            />
          </FormField>
          <FormField
            label="Giới thiệu"
            error={form.formState.errors.bio?.message}
          >
            <Textarea
              rows={10}
              placeholder="Đôi nét về tác giả"
              {...form.register("bio")}
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
