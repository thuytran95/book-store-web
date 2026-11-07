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
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import {
  type AuthorRead,
  useAuthorOptions,
  useDeleteAuthor,
} from "../../hooks/use-admin";

type Props = {
  /** Author being deleted, `null` when closed. */
  author: AuthorRead | null;
  onClose: () => void;
};

/**
 * No books: plain confirm. Has books: pick another author to merge the books into,
 * then delete (`DELETE /admin/authors/{id}?merge_into=`).
 */
export function AuthorDeleteDialog({ author, onClose }: Props) {
  const remove = useDeleteAuthor();
  const [search, setSearch] = useState("");
  const [mergeInto, setMergeInto] = useState<number | "">("");
  const hasBooks = (author?.book_count ?? 0) > 0;
  const options = useAuthorOptions(search, author !== null && hasBooks);
  const others = (options.data ?? []).filter((a) => a.id !== author?.id);

  const close = () => {
    setSearch("");
    setMergeInto("");
    onClose();
  };

  const run = (target?: number) => {
    if (!author) return;
    remove.mutate(
      { id: author.id, mergeInto: target },
      {
        onSuccess: () => {
          toast.success(target ? "Đã gộp sách và xoá tác giả" : "Đã xoá tác giả");
          close();
        },
        // AUTHOR_IN_USE here means a book was linked meanwhile; the list refetches the count.
        onError: (e) => {
          toast.error(errorMessage(e));
          close();
        },
      },
    );
  };

  return (
    <>
      <ConfirmDialog
        open={author !== null && !hasBooks}
        onOpenChange={(o) => !o && close()}
        title={`Xoá tác giả “${author?.name}”?`}
        message="Tác giả chưa có sách nào."
        destructive
        confirmLabel="Xoá"
        loading={remove.isPending}
        onConfirm={() => run()}
      />

      <Dialog open={author !== null && hasBooks} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gộp sách rồi xoá “{author?.name}”</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tác giả có {author?.book_count} sách. Chọn tác giả để gộp sách sang:
          </p>
          <Input
            placeholder="Tìm tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <NativeSelect
            value={mergeInto}
            onChange={(e) => setMergeInto(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Chọn tác giả</option>
            {others.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </NativeSelect>
          <Button
            variant="destructive"
            disabled={mergeInto === "" || remove.isPending}
            onClick={() => mergeInto !== "" && run(mergeInto)}
          >
            Gộp và xoá
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
