"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import type { components } from "@/lib/api/schema";
import { type OrderCancelForm, orderCancelSchema } from "@/lib/validation/order-cancel";
import { CANCEL_PRESETS } from "./order-meta";

type OrderStatus = components["schemas"]["OrderStatus"];

export function OrderCancelDialog({
  order,
  pending,
  onConfirm,
  onOpenChange,
}: {
  /** null = closed. */
  order: { id: number; code: string; status: OrderStatus; copies: number } | null;
  pending: boolean;
  onConfirm: (reason: string | undefined) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<OrderCancelForm>({
    resolver: zodResolver(orderCancelSchema),
    defaultValues: { reason: "" },
  });
  const { reset, setFocus } = form;
  const orderId = order?.id;

  // Fresh form and focused textarea every time the dialog opens.
  useEffect(() => {
    if (orderId == null) return;
    reset({ reason: "" });
    const t = setTimeout(() => setFocus("reason"), 0);
    return () => clearTimeout(t);
  }, [orderId, reset, setFocus]);

  const submit = form.handleSubmit(({ reason }) => onConfirm(reason.trim() || undefined));

  return (
    <Dialog open={order != null} onOpenChange={(open) => !pending && onOpenChange(open)}>
      <DialogContent showCloseButton={false} className="gap-space-md rounded-[1.5rem] p-space-lg sm:max-w-md">
        {order && (
          <form onSubmit={submit} className="contents">
            <DialogHeader>
              <DialogTitle className="text-headline-sm text-on-surface">
                Hủy đơn {order.code}?
              </DialogTitle>
              <DialogDescription className="text-body-md text-on-surface-variant">
                {order.status === "pending" ? (
                  "Đơn chưa trừ tồn kho nên không có gì cần hoàn lại."
                ) : (
                  <>
                    <b className="tabular-nums text-on-surface">{order.copies}</b> bản sẽ được hoàn
                    lại vào kho và hiện lại trên shop nếu sách đang bật hiển thị.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <fieldset className="flex flex-col gap-space-sm" disabled={pending}>
              <legend className="sr-only">Lý do hủy</legend>
              <div className="flex flex-wrap gap-space-xs">
                {CANCEL_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => form.setValue("reason", p, { shouldValidate: true })}
                    className="h-8 rounded-full bg-surface-container px-3 text-label-md hover:bg-surface-container-high"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <FormField label="Lý do hủy" error={form.formState.errors.reason?.message}>
                <Textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Người mua sẽ thấy lý do này trong lịch sử đơn"
                  {...form.register("reason")}
                />
              </FormField>
            </fieldset>

            <DialogFooter className="gap-space-sm">
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Giữ đơn
              </Button>
              <Button type="submit" variant="destructive" disabled={pending} className="rounded-full">
                {pending && (
                  <span
                    aria-label="Đang lưu"
                    className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  />
                )}
                Hủy đơn
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
