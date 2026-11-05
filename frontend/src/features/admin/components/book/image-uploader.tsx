"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/error-messages";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { useDeleteBookImage, useReorderBookImages, useUploadBookImage } from "../../hooks/use-admin";

type BookImage = components["schemas"]["BookImageRead"];

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

type Pending = { key: string; name: string; status: "uploading" | "error"; error?: string };

type Props = {
  /** Undefined until the book is saved: the uploader is disabled. */
  bookId?: number;
  images: BookImage[];
  /** Called after a successful upload, delete, or reorder so the parent can refetch. */
  onChange?: () => void;
};

function validate(file: File): string | null {
  if (!ACCEPT.includes(file.type)) return "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP";
  if (file.size > MAX_BYTES) return "Ảnh vượt quá 5 MB";
  return null;
}

export function ImageUploader({ bookId, images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const upload = useUploadBookImage();
  const remove = useDeleteBookImage();
  const reorder = useReorderBookImages();
  const disabled = bookId === undefined;
  const ordered = [...images].sort((a, b) => a.position - b.position);
  const busy = remove.isPending || reorder.isPending;

  const patch = (key: string, p: Partial<Pending> | null) =>
    setPending((list) =>
      p === null ? list.filter((x) => x.key !== key) : list.map((x) => (x.key === key ? { ...x, ...p } : x)),
    );

  async function handleFiles(files: FileList | File[]) {
    if (bookId === undefined) return;
    for (const file of Array.from(files)) {
      const key = `${file.name}-${file.size}-${crypto.randomUUID()}`;
      const problem = validate(file);
      if (problem) {
        setPending((l) => [...l, { key, name: file.name, status: "error", error: problem }]);
        continue;
      }
      setPending((l) => [...l, { key, name: file.name, status: "uploading" }]);
      try {
        await upload.mutateAsync({ bookId, file });
        patch(key, null);
        onChange?.();
      } catch (e) {
        patch(key, { status: "error", error: errorMessage(e) });
      }
    }
  }

  function move(from: number, to: number) {
    if (bookId === undefined || to < 0 || to >= ordered.length) return;
    const ids = ordered.map((img) => img.id);
    const [id] = ids.splice(from, 1);
    ids.splice(to, 0, id);
    reorder.mutate({ bookId, ids }, { onSuccess: onChange });
  }

  return (
    <div className="grid gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "grid place-items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm",
          dragging && "border-primary bg-primary/5",
          disabled && "opacity-60",
        )}
      >
        <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-muted-foreground">
          {disabled ? "Lưu sách trước khi tải ảnh lên." : "Kéo thả ảnh vào đây hoặc chọn từ máy (JPEG/PNG/WebP, ≤ 5 MB)"}
        </p>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Chọn ảnh
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept={ACCEPT.join(",")}
          aria-label="Chọn ảnh sách"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {pending.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {pending.map((p) => (
            <li key={p.key} className="flex items-center gap-2">
              {p.status === "uploading" ? (
                <Loader2 className="size-4 animate-spin" aria-label="Đang tải lên" />
              ) : (
                <span className="text-destructive" role="alert">
                  {p.error}
                </span>
              )}
              <span className="truncate">{p.name}</span>
              {p.status === "error" && (
                <Button variant="ghost" size="xs" onClick={() => patch(p.key, null)}>
                  Bỏ qua
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {ordered.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ordered.map((img, i) => (
            <li key={img.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Ảnh ${i + 1}`} loading="lazy" className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">Ảnh bìa</span>
              )}
              <Button
                variant="destructive"
                size="icon-xs"
                aria-label={`Xoá ảnh ${i + 1}`}
                className="absolute top-1 right-1"
                disabled={busy}
                onClick={() => remove.mutate({ bookId: bookId!, imageId: img.id }, { onSuccess: onChange })}
              >
                <Trash2 />
              </Button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <Button
                  variant="secondary"
                  size="icon-xs"
                  aria-label={`Đưa ảnh ${i + 1} sang trái`}
                  disabled={busy || i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  aria-label={`Đưa ảnh ${i + 1} sang phải`}
                  disabled={busy || i === ordered.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
