"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { hasCode } from "@/lib/api/errors";
import { errorMessage } from "@/lib/error-messages";
import { applyServerErrors } from "@/lib/forms";
import { toast } from "@/lib/toast";
import { bookSchema, type BookForm as Values } from "@/lib/validation/book";
import {
  useAdminBook,
  useAdminCategories,
  useSaveBook,
  useUploadBookImage,
} from "../../hooks/use-admin";
import { AuthorPicker } from "../author/author-picker";
import { ImageUploader } from "./image-uploader";

const EMPTY: Values = {
  category_id: 0,
  title: "",
  authors: [],
  publisher: "",
  published_year: undefined,
  price: 0,
  condition_pct: 80,
  description: "",
  quantity: 1,
  is_visible: true,
};

export function BookForm({ bookId }: { bookId?: number }) {
  const router = useRouter();
  const isNew = bookId === undefined;
  const { data: book, isLoading, error } = useAdminBook(bookId);
  const { data: categories = [] } = useAdminCategories();
  const save = useSaveBook();
  const upload = useUploadBookImage();
  /** Images picked before the book exists; uploaded right after it is created. */
  const [drafts, setDrafts] = useState<File[]>([]);
  const [uploadingDrafts, setUploadingDrafts] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(bookSchema) as Resolver<Values>,
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!book) return;
    form.reset({
      category_id: book.category.id,
      title: book.title,
      authors: book.authors.map((a) => ({ id: a.id, name: a.name })),
      publisher: book.publisher ?? "",
      published_year: book.published_year ?? undefined,
      price: book.price,
      condition_pct: book.condition_pct,
      description: book.description ?? "",
      quantity: book.quantity,
      is_visible: book.is_visible,
    });
  }, [book, form]);

  if (!isNew && isLoading) return <Skeleton className="h-96" />;
  if (!isNew && error) return <ErrorMessage error={error} />;

  const { register, handleSubmit, control, formState } = form;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <form
        noValidate
        className="grid gap-3"
        onSubmit={handleSubmit((v) => {
          const body = {
            category_id: v.category_id,
            title: v.title,
            author_ids: v.authors.map((a) => a.id),
            publisher: v.publisher || null,
            published_year: v.published_year ?? null,
            price: v.price,
            condition_pct: v.condition_pct,
            description: v.description || null,
            is_visible: v.is_visible,
            quantity: v.quantity,
          };
          save.mutate(
            { id: bookId, body },
            {
              onSuccess: async (saved) => {
                if (isNew && drafts.length > 0) {
                  setUploadingDrafts(true);
                  let failed = 0;
                  // Sequential so positions follow the chosen order.
                  for (const file of drafts) {
                    try {
                      await upload.mutateAsync({ bookId: saved.id, file });
                    } catch {
                      failed += 1;
                    }
                  }
                  setUploadingDrafts(false);
                  setDrafts([]);
                  if (failed > 0) {
                    toast.error(`Đã tạo sách nhưng ${failed} ảnh tải lên thất bại`);
                  } else {
                    toast.success("Đã lưu sách");
                  }
                } else {
                  toast.success("Đã lưu sách");
                }
                if (isNew) router.replace(`/admin/books/${saved.id}`);
              },
              onError: (e) => {
                if (hasCode(e, "AUTHOR_NOT_FOUND")) {
                  form.setError("authors", {
                    type: "server",
                    message: errorMessage(e),
                  });
                  return;
                }
                applyServerErrors(e, form.setError);
              },
            },
          );
        })}
      >
        <FormField
          label="Tên sách"
          required
          error={formState.errors.title?.message}
        >
          <Input {...register("title")} />
        </FormField>
        <FormField label="Tác giả" error={formState.errors.authors?.message}>
          <Controller
            control={control}
            name="authors"
            render={({ field }) => (
              <AuthorPicker
                value={field.value}
                onChange={field.onChange}
                invalid={!!formState.errors.authors}
              />
            )}
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Nhà xuất bản"
            error={formState.errors.publisher?.message}
          >
            <Input {...register("publisher")} />
          </FormField>
          <FormField
            label="Năm xuất bản"
            error={formState.errors.published_year?.message}
          >
            <Input type="number" {...register("published_year")} />
          </FormField>
        </div>
        <FormField
          label="Thể loại"
          required
          error={formState.errors.category_id?.message}
        >
          <NativeSelect {...register("category_id", { valueAsNumber: true })}>
            <option value={0}>Chọn thể loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Giá bán (đ)"
            required
            error={formState.errors.price?.message}
          >
            <Input
              type="number"
              min={0}
              step={1000}
              {...register("price")}
            />
          </FormField>
          <FormField
            label="Tình trạng (%)"
            required
            error={formState.errors.condition_pct?.message}
          >
            <Input
              type="number"
              min={10}
              max={100}
              {...register("condition_pct")}
            />
          </FormField>
        </div>
        <FormField
          label="Số lượng"
          required
          hint="Số bản đang có trong kho. Đặt 0 khi sách đã bán hết."
          error={formState.errors.quantity?.message}
        >
          <Input type="number" min={0} {...register("quantity")} />
        </FormField>
        <FormField label="Mô tả" error={formState.errors.description?.message}>
          <Textarea rows={6} {...register("description")} />
        </FormField>
        <Controller
          control={control}
          name="is_visible"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="visible"
                checked={field.value}
                onCheckedChange={(c) => field.onChange(c === true)}
              />
              <Label htmlFor="visible">Hiện trên cửa hàng</Label>
            </div>
          )}
        />
        <ErrorMessage error={save.error} />
        <Button
          type="submit"
          className="justify-self-start"
          disabled={save.isPending || uploadingDrafts}
        >
          {uploadingDrafts
            ? "Đang tải ảnh lên..."
            : isNew
              ? "Tạo sách"
              : "Lưu thay đổi"}
        </Button>
      </form>

      <aside className="grid content-start gap-2">
        <h2 className="font-semibold">Ảnh</h2>
        <ImageUploader
          bookId={bookId}
          images={book?.images ?? []}
          drafts={isNew ? drafts : undefined}
          onDraftsChange={isNew ? setDrafts : undefined}
        />
      </aside>
    </div>
  );
}
