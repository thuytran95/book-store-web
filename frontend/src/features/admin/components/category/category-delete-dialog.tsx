"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { ApiError, hasCode } from "@/lib/api/errors";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import {
  type CategoryRead as Category,
  useDeleteCategory,
} from "../../hooks/use-admin";

type Props = {
  /** Category being deleted, `null` when closed. */
  category: Category | null;
  /** All categories, used to pick where to move books. */
  categories: Category[];
  onClose: () => void;
};

/**
 * Delete flow: a confirm dialog, then — if the category still has books —
 * a second dialog to pick a target category to move them to.
 */
export function CategoryDeleteDialog({ category, categories, onClose }: Props) {
  const remove = useDeleteCategory();
  const [needMove, setNeedMove] = useState(false);
  const [moveTo, setMoveTo] = useState<number | "">("");

  const others = categories.filter((c) => c.id !== category?.id);

  const close = () => {
    setNeedMove(false);
    setMoveTo("");
    onClose();
  };

  return (
    <>
      <ConfirmDialog
        open={category !== null && !needMove}
        onOpenChange={(o) => !o && close()}
        title={`Xoá thể loại “${category?.name}”?`}
        message="Nếu còn sách, bạn sẽ được yêu cầu chuyển chúng sang thể loại khác."
        destructive
        confirmLabel="Xoá"
        loading={remove.isPending}
        onConfirm={() => {
          if (!category) return;
          remove.mutate(
            { id: category.id },
            {
              onSuccess: () => {
                toast.success("Đã xoá thể loại");
                close();
              },
              onError: (e) => {
                if (hasCode(e, "CATEGORY_NOT_EMPTY")) {
                  setNeedMove(true);
                  return;
                }
                toast.error(errorMessage(e));
                close();
              },
            },
          );
        }}
      />

      <Dialog open={needMove} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển sách rồi xoá</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Thể loại vẫn còn sách
            {category && category.book_count ? ` (${category.book_count})` : ""}
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
              if (!category || moveTo === "") return;
              remove.mutate(
                { id: category.id, moveTo: Number(moveTo) },
                {
                  onSuccess: () => {
                    toast.success("Đã chuyển sách và xoá thể loại");
                    close();
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
    </>
  );
}
