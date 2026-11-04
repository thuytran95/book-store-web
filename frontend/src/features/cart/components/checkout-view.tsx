"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AddressPicker } from "@/features/account/components/address-picker";
import { useAddresses } from "@/features/account/hooks";
import { usePlaceOrder } from "@/features/orders/hooks";
import { ApiError, hasCode } from "@/lib/api/errors";
import { formatVnd } from "@/lib/format";
import { toast } from "@/lib/toast";
import { checkoutSchema } from "@/lib/validation/checkout";
import { cn } from "@/lib/utils";
import { useCart } from "../hooks/use-cart";

const BANK_INFO = process.env.NEXT_PUBLIC_BANK_TRANSFER_INFO ?? "Vui lòng liên hệ cửa hàng để nhận thông tin chuyển khoản.";
const SHIPPING_FEE = 0; // open question: flat / threshold / admin-entered. Server sets the real fee.

export function CheckoutView() {
  const router = useRouter();
  const params = useSearchParams();
  const reservationIds = useMemo(
    () =>
      (params.get("reservation") ?? "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0),
    [params],
  );

  const { items, total, isLoading: cartLoading, remove } = useCart();
  const { data: addresses, isLoading: addrLoading } = useAddresses();
  const place = usePlaceOrder();

  const [addressId, setAddressId] = useState<number | null>(null);
  const [payment, setPayment] = useState<"cod" | "bank_transfer">("cod");
  const [note, setNote] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (addressId === null && addresses?.length) {
      setAddressId((addresses.find((a) => a.is_default) ?? addresses[0]).id);
    }
  }, [addresses, addressId]);

  if (cartLoading || addrLoading) return <Skeleton className="h-64" />;
  if (items.length === 0 && reservationIds.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        action={<Button render={<Link href="/books" />}>Xem sách</Button>}
      />
    );
  }

  const err = place.error;
  const outOfStockBookId =
    hasCode(err, "OUT_OF_STOCK", "BOOK_UNAVAILABLE") && err instanceof ApiError
      ? (err.details.book_id as number | undefined)
      : undefined;
  const culprit = items.find((i) => i.book.id === outOfStockBookId);

  function submit() {
    const parsed = checkoutSchema.safeParse({
      address_id: addressId ?? undefined,
      payment_method: payment,
      note: note || undefined,
    });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }
    setFieldError(null);
    place.mutate(
      { ...parsed.data, note: parsed.data.note ?? null, reservation_ids: reservationIds },
      {
        onSuccess: (order) => {
          toast.success(`Đặt hàng thành công. Mã đơn ${order.code}`);
          router.replace(`/orders/${order.id}?placed=1`);
        },
      },
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_22rem]">
      <div className="grid content-start gap-6">
        <section aria-labelledby="co-addr" className="grid gap-2">
          <h2 id="co-addr" className="font-semibold">Địa chỉ giao hàng</h2>
          <AddressPicker addresses={addresses ?? []} value={addressId} onChange={setAddressId} />
          {fieldError && <p role="alert" className="text-sm text-destructive">{fieldError}</p>}
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
                  name="payment"
                  className="accent-primary"
                  checked={payment === value}
                  onChange={() => setPayment(value)}
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

        <FormField label="Ghi chú" hint="Tuỳ chọn">
          <Textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
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
          {reservationIds.length > 0 && (
            <li className="text-muted-foreground">+ {reservationIds.length} lượt giữ sách sẽ được thêm vào đơn</li>
          )}
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
              <Button variant="outline" size="sm" onClick={() => { remove(culprit.book.id); place.reset(); }}>
                Xoá &quot;{culprit.book.title}&quot; khỏi giỏ
              </Button>
            )}
          </div>
        )}

        <Button className="mt-4 w-full" size="lg" disabled={place.isPending || !addresses?.length} onClick={submit}>
          Đặt hàng
        </Button>
        {!addresses?.length && (
          <p className="mt-2 text-xs text-muted-foreground">Thêm địa chỉ giao hàng để tiếp tục.</p>
        )}
      </aside>
    </div>
  );
}
