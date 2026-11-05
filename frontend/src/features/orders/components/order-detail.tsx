"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { OrderStatusBadge, PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";
import { hasCode } from "@/lib/api/errors";
import { formatDate, formatVnd, paymentLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useCancelOrder, useOrder } from "../hooks/use-orders";
import { StatusTimeline } from "./status-timeline";
import { LinkButton } from "@/components/shared/link-button";

export function OrderDetail() {
  const id = Number(useParams().id);
  const placed = useSearchParams().get("placed") === "1";
  const { data: order, isLoading, error } = useOrder(id);
  const cancel = useCancelOrder();
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <Skeleton className="h-64" />;
  if (hasCode(error, "NOT_FOUND") || (!isLoading && !order && !error)) {
    return (
      <EmptyState
        title="Không tìm thấy đơn hàng"
        action={<LinkButton href="/orders">Đơn hàng của tôi</LinkButton>}
      />
    );
  }
  if (error && !order) return <ErrorMessage error={error} />;
  if (!order) return null;

  const canCancel = order.status === "pending";
  const cancelError = cancel.error;

  return (
    <div className="grid gap-6">
      {placed && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Đặt hàng thành công. Mã đơn <strong>{order.code}</strong>.
        </p>
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Đơn hàng</p>
          <h1 className="text-2xl font-bold">{order.code}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <StatusTimeline
        history={order.history.map((h) => ({ status: h.to_status, at: h.at }))}
        current={order.status}
        cancelledReason={order.cancelled_reason}
      />

      <section className="grid gap-2">
        <h2 className="font-semibold">Sản phẩm</h2>
        <ul className="divide-y rounded-xl border">
          {order.items.map((i) => (
            <li key={`${i.book_id}-${i.title_snapshot}`} className="flex justify-between gap-3 p-3 text-sm">
              <span>
                {i.quantity} × {i.title_snapshot}
              </span>
              <span className="tabular-nums">{formatVnd(i.unit_price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-1 text-sm">
        <h2 className="font-semibold">Giao hàng</h2>
        <p>
          {order.ship_recipient} · {order.ship_phone}
        </p>
        <p className="text-muted-foreground">{order.ship_address}</p>
        <p>Thanh toán: {paymentLabel(order.payment_method)}</p>
        {order.note && <p>Ghi chú: {order.note}</p>}
      </section>

      <div className="grid gap-1 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span className="tabular-nums">{formatVnd(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span>{order.shipping_fee === 0 ? "Sẽ xác nhận sau" : formatVnd(order.shipping_fee)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Tổng</span>
          <PriceTag amount={order.total} size="lg" />
        </div>
      </div>

      {canCancel && (
        <div className="grid justify-items-start gap-2">
          {hasCode(cancelError, "INVALID_TRANSITION") ? (
            <p role="alert" className="text-sm text-destructive">
              Đơn hàng đã được xử lý, không thể huỷ.
            </p>
          ) : (
            <ErrorMessage error={cancelError} />
          )}
          <Button variant="destructive" onClick={() => setConfirm(true)} disabled={cancel.isPending}>
            Huỷ đơn
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Huỷ đơn hàng?"
        message="Chỉ huỷ được khi đơn còn chờ xác nhận."
        destructive
        confirmLabel="Huỷ đơn"
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(
            { id: order.id },
            {
              onSuccess: () => {
                toast.success("Đã huỷ đơn hàng");
                setConfirm(false);
              },
              onError: () => setConfirm(false),
            },
          )
        }
      />
    </div>
  );
}
