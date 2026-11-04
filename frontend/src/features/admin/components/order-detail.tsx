"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { OrderStatusBadge, PriceTag } from "@/components/shared/badges";
import { StatusTimeline } from "@/features/orders/components/status-timeline";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { hasCode } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";
import { errorMessage } from "@/lib/error-messages";
import { formatDate, formatVnd, orderStatusLabel, paymentLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useAdminOrder, useTransitionOrder } from "../hooks/use-admin";

type OrderStatus = components["schemas"]["OrderStatus"];

const ACTION: Record<OrderStatus, { label: string; message: string; destructive?: boolean }> = {
  pending: { label: "Chờ xác nhận", message: "" },
  confirmed: {
    label: "Xác nhận đơn",
    message: "Xác nhận sẽ trừ kho. Không thể hoàn tác trừ khi huỷ đơn.",
  },
  shipping: { label: "Giao hàng", message: "Đánh dấu đơn đang được giao." },
  completed: { label: "Hoàn thành", message: "Đánh dấu khách đã nhận hàng." },
  cancelled: {
    label: "Huỷ đơn",
    message: "Huỷ sẽ hoàn kho nếu đơn đã được xác nhận.",
    destructive: true,
  },
};

export function AdminOrderDetail() {
  const id = Number(useParams().id);
  const { data: order, isLoading, error } = useAdminOrder(id);
  const transition = useTransitionOrder();
  const [pendingTo, setPendingTo] = useState<OrderStatus | null>(null);
  const [reason, setReason] = useState("");

  if (isLoading) return <Skeleton className="h-64" />;
  if (hasCode(error, "NOT_FOUND") || (!order && !error)) {
    return <EmptyState title="Không tìm thấy đơn" action={<Button render={<Link href="/admin/orders" />}>Danh sách</Button>} />;
  }
  if (error && !order) return <ErrorMessage error={error} />;
  if (!order) return null;

  const action = pendingTo ? ACTION[pendingTo] : null;

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/orders" className="hover:underline">
              Đơn hàng
            </Link>
          </p>
          <h1 className="text-2xl font-bold">{order.code}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)} · người dùng #{order.user_id}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <StatusTimeline
        history={order.history.map((h) => ({ status: h.to_status, at: h.at }))}
        current={order.status}
        cancelledReason={order.cancelled_reason}
      />

      <div className="flex flex-wrap gap-2">
        {order.allowed_transitions.map((to) => (
          <Button
            key={to}
            variant={ACTION[to].destructive ? "destructive" : "default"}
            onClick={() => {
              setPendingTo(to);
              setReason("");
            }}
          >
            {ACTION[to].label}
          </Button>
        ))}
      </div>
      {hasCode(transition.error, "OUT_OF_STOCK") ? (
        <p role="alert" className="text-sm text-destructive">
          Không đủ hàng để xác nhận đơn này.
        </p>
      ) : hasCode(transition.error, "INVALID_TRANSITION") ? (
        <p role="alert" className="text-sm text-destructive">
          Trạng thái đơn đã thay đổi, hãy tải lại trang.
        </p>
      ) : (
        <ErrorMessage error={transition.error} />
      )}

      <section className="grid gap-2">
        <h2 className="font-semibold">Sản phẩm</h2>
        <ul className="divide-y rounded-xl border">
          {order.items.map((i) => (
            <li key={`${i.book_id}-${i.title_snapshot}`} className="flex justify-between gap-3 p-3 text-sm">
              <Link href={`/admin/books/${i.book_id}`} className="hover:underline">
                {i.quantity} × {i.title_snapshot}
              </Link>
              <span className="tabular-nums">{formatVnd(i.unit_price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-1 text-sm">
        <h2 className="font-semibold">Giao hàng & thanh toán</h2>
        <p>
          {order.ship_recipient} · {order.ship_phone}
        </p>
        <p className="text-muted-foreground">{order.ship_address}</p>
        <p>{paymentLabel(order.payment_method)}</p>
        {order.note && <p>Ghi chú: {order.note}</p>}
        <div className="mt-2 flex items-center justify-between">
          <span>Tổng</span>
          <PriceTag amount={order.total} />
        </div>
      </section>

      <Dialog open={pendingTo !== null} onOpenChange={(o) => !o && setPendingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action ? `${action.label}?` : "Chuyển trạng thái?"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {action?.message || `Chuyển sang ${pendingTo ? orderStatusLabel(pendingTo) : ""}.`}
          </p>
          {pendingTo === "cancelled" && (
            <FormField label="Lý do huỷ" required>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
            </FormField>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingTo(null)} disabled={transition.isPending}>
              Đóng
            </Button>
            <Button
              variant={action?.destructive ? "destructive" : "default"}
              disabled={transition.isPending || (pendingTo === "cancelled" && !reason.trim())}
              onClick={() => {
                if (!pendingTo) return;
                transition.mutate(
                  { id: order.id, to: pendingTo, reason: reason.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success("Đã cập nhật đơn hàng");
                      setPendingTo(null);
                    },
                    onError: (e) => toast.error(errorMessage(e)),
                  },
                );
              }}
            >
              {action?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
