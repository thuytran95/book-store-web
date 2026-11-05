"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { applyServerErrors } from "@/lib/forms";
import { toast } from "@/lib/toast";
import { bookSchema, type BookForm as Values } from "@/lib/validation/book";
import {
  useAdminBook,
  useAdminCategories,
  useSaveBook,
} from "../../hooks/use-admin";
import { ImageUploader } from "./image-uploader";

const EMPTY: Values = {
  category_id: 0,
  title: "",
  author: "",
  publisher: "",
  published_year: undefined,
  cost_price: 0,
  sale_price: 0,
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
  const form = useForm<Values>({
    resolver: zodResolver(bookSchema) as Resolver<Values>,
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!book) return;
    form.reset({
      category_id: book.category.id,
      title: book.title,
      author: book.author ?? "",
      publisher: book.publisher ?? "",
      published_year: book.published_year ?? undefined,
      cost_price: book.cost_price,
      sale_price: book.sale_price,
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
            author: v.author || null,
            publisher: v.publisher || null,
            published_year: v.published_year ?? null,
            cost_price: v.cost_price,
            sale_price: v.sale_price,
            condition_pct: v.condition_pct,
            description: v.description || null,
            is_visible: v.is_visible,
            ...(isNew ? { quantity: v.quantity } : {}),
          };
          save.mutate(
            { id: bookId, body },
            {
              onSuccess: (saved) => {
                toast.success("Đã lưu sách");
                if (isNew) router.replace(`/admin/books/${saved.id}`);
              },
              onError: (e) => applyServerErrors(e, form.setError),
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
        <FormField label="Tác giả" error={formState.errors.author?.message}>
          <Input {...register("author")} />
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
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            label="Giá vốn (đ)"
            error={formState.errors.cost_price?.message}
          >
            <Input
              type="number"
              min={0}
              step={1000}
              {...register("cost_price")}
            />
          </FormField>
          <FormField
            label="Giá bán (đ)"
            required
            error={formState.errors.sale_price?.message}
          >
            <Input
              type="number"
              min={0}
              step={1000}
              {...register("sale_price")}
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
        {isNew && (
          <FormField
            label="Số lượng"
            required
            hint="Sau khi tạo, kho chỉ đổi qua đánh dấu bán / đơn hàng."
            error={formState.errors.quantity?.message}
          >
            <Input type="number" min={0} {...register("quantity")} />
          </FormField>
        )}
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
          disabled={save.isPending}
        >
          {isNew ? "Tạo sách" : "Lưu thay đổi"}
        </Button>
      </form>

      <aside className="grid content-start gap-2">
        <h2 className="font-semibold">Ảnh</h2>
        <ImageUploader
          bookId={bookId}
          images={book?.images ?? []}
          onChange={() => undefined}
        />
      </aside>
    </div>
  );
}
