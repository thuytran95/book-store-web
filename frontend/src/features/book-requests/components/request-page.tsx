"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { applyServerErrors } from "@/lib/forms";
import { formatDate, requestStatusLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { bookRequestSchema, type BookRequestForm } from "@/lib/validation/book-request";
import { useBookRequests, useCreateBookRequest } from "../hooks/use-book-requests";

const TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  available: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function RequestPage() {
  const prefill = useSearchParams().get("title") ?? "";
  const { data, isLoading, error } = useBookRequests();
  const create = useCreateBookRequest();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BookRequestForm>({
    resolver: zodResolver(bookRequestSchema),
    defaultValues: { title: prefill, author: "", note: "" },
  });

  useEffect(() => {
    if (prefill) reset({ title: prefill, author: "", note: "" });
  }, [prefill, reset]);

  return (
    <div className="grid gap-8 md:grid-cols-[20rem_1fr]">
      <form
        noValidate
        className="grid h-fit gap-3 rounded-xl border p-4"
        onSubmit={handleSubmit((v) =>
          create.mutate(
            { title: v.title, author: v.author || null, note: v.note || null },
            {
              onSuccess: () => {
                toast.success("Đã gửi yêu cầu tìm sách");
                reset({ title: "", author: "", note: "" });
              },
              onError: (e) => applyServerErrors(e, setError),
            },
          ),
        )}
      >
        <h2 className="font-semibold">Gửi yêu cầu</h2>
        <FormField label="Tên sách" required error={errors.title?.message}>
          <Input {...register("title")} />
        </FormField>
        <FormField label="Tác giả" error={errors.author?.message}>
          <Input {...register("author")} />
        </FormField>
        <FormField label="Ghi chú" error={errors.note?.message}>
          <Textarea {...register("note")} />
        </FormField>
        <ErrorMessage error={create.error} />
        <Button type="submit" disabled={create.isPending}>
          Gửi yêu cầu
        </Button>
      </form>

      <section className="grid content-start gap-3">
        <h2 className="font-semibold">Yêu cầu của bạn</h2>
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : error ? (
          <ErrorMessage error={error} />
        ) : !data?.length ? (
          <EmptyState title="Chưa có yêu cầu nào" description="Điền form bên cạnh nếu bạn cần tìm một cuốn sách." />
        ) : (
          <ul className="grid gap-3">
            {data.map((r) => (
              <li key={r.id} className="grid gap-1 rounded-xl border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{r.title}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TONE[r.status])}>
                    {requestStatusLabel(r.status)}
                  </span>
                </div>
                {r.author && <p className="text-muted-foreground">{r.author}</p>}
                {r.note && <p>{r.note}</p>}
                {r.admin_note && <p className="text-muted-foreground">Phản hồi: {r.admin_note}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
