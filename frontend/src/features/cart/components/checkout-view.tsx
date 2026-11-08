"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LinkButton } from "@/components/shared/link-button";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { usePlaceOrder } from "@/features/orders/hooks";
import { ApiError, hasCode } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import { useSession } from "@/lib/session";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutForm } from "@/lib/validation/checkout";
import { useCart } from "../hooks/use-cart";
import { CheckoutStep } from "./checkout-steps";
import { CheckoutMobileBar, CheckoutSummary } from "./checkout-summary";

const BANK_INFO =
  process.env.NEXT_PUBLIC_BANK_TRANSFER_INFO ??
  "Vui lòng liên hệ cửa hàng để nhận thông tin chuyển khoản.";

const PAYMENT_OPTIONS = [
  {
    value: "cod",
    icon: "payments",
    title: "Trả tiền khi nhận hàng",
    body: "Thanh toán tiền mặt cho người giao khi sách tới tay bạn.",
  },
  {
    value: "bank_transfer",
    icon: "account_balance",
    title: "Chuyển khoản ngân hàng",
    body: "Chuyển trước, cửa hàng xác nhận đã nhận tiền rồi giao sách.",
  },
] as const;

export function CheckoutView() {
  const router = useRouter();
  const { session } = useSession();
  const { items, total, count, isLoading: cartLoading, remove } = useCart();
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

  if (cartLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-[1fr_23rem]">
        <Skeleton className="h-96 rounded-serene-md" />
        <Skeleton className="h-96 rounded-serene-md" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng đang trống"
        description="Chọn vài cuốn sách rồi quay lại đây để đặt hàng."
        action={<LinkButton href="/books">Xem sách</LinkButton>}
      />
    );
  }

  // Stock can change between the cart page and here; stop early instead of failing on submit.
  const blocked = items.some(
    (i) => !i.book.is_visible || i.available <= 0 || i.quantity > i.available,
  );

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

  let alert: React.ReactNode = null;
  if (err) {
    alert = (
      <>
        <ErrorMessage error={err} />
        {culprit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              remove(culprit.book.id);
              place.reset();
            }}
          >
            Xoá &quot;{culprit.book.title}&quot; khỏi giỏ
          </Button>
        )}
      </>
    );
  } else if (blocked) {
    alert = (
      <p role="alert" className="text-sm text-destructive">
        Có sách trong giỏ đã hết hoặc không đủ số lượng.{" "}
        <Link
          href="/cart"
          className="font-semibold underline underline-offset-2"
        >
          Sửa giỏ hàng
        </Link>
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="grid items-start gap-10 pb-24 md:grid-cols-[1fr_23rem] md:pb-0 lg:grid-cols-[1fr_25rem] lg:gap-16"
    >
      <div className="max-w-2xl">
        <CheckoutStep
          n={1}
          title="Thông tin giao hàng"
          description="Người nhận và địa chỉ để giao sách."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Người nhận"
              required
              error={errors.ship_recipient?.message}
            >
              <Input autoComplete="name" {...register("ship_recipient")} />
            </FormField>
            <FormField
              label="Số điện thoại"
              required
              error={errors.ship_phone?.message}
            >
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register("ship_phone")}
              />
            </FormField>
          </div>
          <FormField
            label="Địa chỉ"
            required
            hint="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            error={errors.ship_address?.message}
          >
            <Textarea
              rows={3}
              autoComplete="street-address"
              maxLength={500}
              className="min-h-24 px-4 py-3"
              {...register("ship_address")}
            />
          </FormField>
        </CheckoutStep>

        <CheckoutStep n={2} title="Phương thức thanh toán">
          <div
            role="radiogroup"
            aria-label="Phương thức thanh toán"
            className="grid gap-3 sm:grid-cols-2"
          >
            {PAYMENT_OPTIONS.map((opt) => {
              const selected = payment === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-3 rounded-serene border p-4 transition-colors",
                    "has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
                    selected
                      ? "border-primary bg-pod-mint"
                      : "border-outline-variant/70 hover:border-outline",
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                    {...register("payment_method")}
                  />
                  <span className="flex items-center justify-between">
                    <MaterialIcon
                      name={opt.icon}
                      filled={selected}
                      className={cn(
                        "text-[28px]",
                        selected ? "text-primary" : "text-outline",
                      )}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-5 place-items-center rounded-full border-2",
                        selected ? "border-primary" : "border-outline-variant",
                      )}
                    >
                      {selected && (
                        <span className="size-2.5 rounded-full bg-primary" />
                      )}
                    </span>
                  </span>
                  <span className="grid gap-0.5">
                    <span className="font-semibold text-on-surface">
                      {opt.title}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {opt.body}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {payment === "bank_transfer" && (
            <div className="flex gap-3 rounded-serene bg-pod-honey p-4 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
              <MaterialIcon
                name="account_balance"
                className="text-xl text-tertiary"
              />
              <div className="grid gap-1">
                <p className="font-semibold text-tertiary">
                  Thông tin chuyển khoản
                </p>
                <p className="whitespace-pre-line text-on-surface">
                  {BANK_INFO}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Cửa hàng xác nhận đơn sau khi nhận được tiền.
                </p>
              </div>
            </div>
          )}
        </CheckoutStep>

        <CheckoutStep
          n={3}
          title="Nội dung ghi chú"
          description="Ghi chú cho cửa hàng."
          last
        >
          <FormField
            label="Ghi chú"
            hint="Ví dụ: giờ nhận hàng thuận tiện, gọi trước khi giao."
            error={errors.note?.message}
          >
            <Textarea
              rows={3}
              maxLength={500}
              className="min-h-24 px-4 py-3"
              {...register("note")}
            />
          </FormField>
        </CheckoutStep>
      </div>

      <CheckoutSummary
        items={items}
        total={total}
        count={count}
        flaggedBookId={outOfStockBookId}
        alert={alert}
        pending={place.isPending}
        disabled={blocked}
      />
      <CheckoutMobileBar
        total={total}
        pending={place.isPending}
        disabled={blocked}
      />
    </form>
  );
}
