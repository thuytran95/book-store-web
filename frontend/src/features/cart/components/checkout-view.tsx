"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePlaceOrder } from "@/features/orders/hooks";
import { ApiError, hasCode } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import { formatVnd } from "@/lib/format";
import { useSession } from "@/lib/session";
import { toast } from "@/lib/toast";
import { checkoutSchema, type CheckoutForm } from "@/lib/validation/checkout";
import { cn } from "@/lib/utils";
import { useCart } from "../hooks/use-cart";
import { LinkButton } from "@/components/shared/link-button";

const BANK_INFO = process.env.NEXT_PUBLIC_BANK_TRANSFER_INFO ?? "Vui lòng liên hệ cửa hàng để nhận thông tin chuyển khoản.";
const SHIPPING_FEE = 0; // open question: flat / threshold / admin-entered. Server sets the real fee.

export function CheckoutView() {
  const router = useRouter();
  const { session } = useSession();
  const { items, total, isLoading: cartLoading, remove } = useCart();
  const place = usePlaceOrder();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    getValues,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ship_recipient: "",
      ship_phone: "",
      ship_address: "",
      payment_method: "cod",
      note: "",
    },
  });
  const payment = watch("payment_method");

  // Prefill the recipient from the profile once, without overwriting what the buyer typed.
  const user = session?.user;
  useEffect(() => {
    if (!user) return;
    const v = getValues();
    reset({
      ...v,
      ship_recipient: v.ship_recipient || user.full_name,
      ship_phone: v.ship_phone || (user.phone ?? ""),
    });
  }, [user, reset, getValues]);

  if (cartLoading) return <Skeleton className="h-64" />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        action={<LinkButton href="/books">Xem sách</LinkButton>}
      />
    );
  }

  const err = place.error;
  const outOfStockBookId =
    hasCode(err, "OUT_OF_STOCK", "BOOK_UNAVAILABLE") && err instanceof ApiError
      ? (err.details.book_id as number | undefined)
      : undefined;
  const culprit = items.find((i) => i.book.id === outOfStockBookId);

  const submit = handleSubmit((v) =>
    place.mutate(
      { ...v, note: v.note || null },
      {
        onSuccess: (order) => {
          toast.success(`Đặt hàng thành công. Mã đơn ${order.code}`);
          router.replace(`/orders/${order.id}?placed=1`);
        },
        onError: (e) => applyServerErrors(e, setError),
      },
    ),
  );

  return (
    <form noValidate onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_22rem]">
      <div className="grid content-start gap-6">
        <section aria-labelledby="co-addr" className="grid gap-3">
          <h2 id="co-addr" className="font-semibold">Thông tin giao hàng</h2>
          <FormField label="Người nhận" required error={errors.ship_recipient?.message}>
            <Input autoComplete="name" {...register("ship_recipient")} />
          </FormField>
          <FormField label="Số điện thoại" required error={errors.ship_phone?.message}>
            <Input type="tel" autoComplete="tel" {...register("ship_phone")} />
          </FormField>
          <FormField
            label="Địa chỉ"
            required
            hint="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            error={errors.ship_address?.message}
          >
            <Textarea autoComplete="street-address" maxLength={500} {...register("ship_address")} />
          </FormField>
        </section>

        <section aria-labelledby="co-pay" className="grid gap-2">
          <h2 id="co-pay" className="font-semibold">Phương thức thanh toán</h2>
          <div role="radiogroup" className="grid gap-2">
            {(
              [
                ["cod", "Thanh toán khi nhận hàng (COD)"],
                ["bank_transfer", "Chuyển khoản ngân hàng"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm",
                  payment === value && "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="accent-primary"
                  {...register("payment_method")}
                />
                {label}
              </label>
            ))}
          </div>
          {payment === "bank_transfer" && (
            <p className="rounded-lg bg-muted p-3 text-sm">
              <strong>Thông tin chuyển khoản:</strong> {BANK_INFO}
              <br />
              <span className="text-muted-foreground">Quản trị viên sẽ xác nhận sau khi nhận được tiền.</span>
            </p>
          )}
        </section>

        <FormField label="Ghi chú" hint="Tuỳ chọn" error={errors.note?.message}>
          <Textarea maxLength={500} {...register("note")} />
        </FormField>
      </div>

      <aside className="sticky bottom-16 h-fit rounded-xl border bg-background p-4 md:top-24 md:bottom-auto">
        <h2 className="mb-2 font-semibold">Đơn hàng</h2>
        <ul className="grid gap-1 text-sm">
          {items.map((i) => (
            <li
              key={i.book.id}
              className={cn("flex justify-between gap-2", i.book.id === outOfStockBookId && "text-destructive")}
            >
              <span className="line-clamp-1">{i.quantity} × {i.book.title}</span>
              <span className="tabular-nums">{formatVnd(i.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between text-sm">
          <span>Phí vận chuyển</span>
          <span>{SHIPPING_FEE === 0 ? "Sẽ xác nhận sau" : formatVnd(SHIPPING_FEE)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-medium">Tạm tính</span>
          <PriceTag amount={total + SHIPPING_FEE} size="lg" />
        </div>

        {err && (
          <div className="mt-3 grid gap-2">
            <ErrorMessage error={err} />
            {culprit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { remove(culprit.book.id); place.reset(); }}
              >
                Xoá &quot;{culprit.book.title}&quot; khỏi giỏ
              </Button>
            )}
          </div>
        )}

        <Button type="submit" className="mt-4 w-full" size="lg" disabled={place.isPending}>
          Đặt hàng
        </Button>
      </aside>
    </form>
  );
}
