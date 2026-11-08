"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { components } from "@/lib/api/schema";
import { formatVnd, paymentShortLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NEXT_STEP } from "./order-meta";
import { OrderNextStepButton, OrderRowMenu } from "./order-row-actions";
import { OrderStatusChip } from "./order-status-chip";

type AdminOrderSummary = components["schemas"]["AdminOrderSummary"];
type OrderStatus = components["schemas"]["OrderStatus"];

/** Mobile (< md) order list: same data as the table row. */
export function OrdersCardList({
  orders,
  total,
  isLoading,
  savingId,
  onOpen,
  onAdvance,
  onCancel,
}: {
  orders: AdminOrderSummary[];
  total: number;
  isLoading: boolean;
  savingId: number | null;
  onOpen: (id: number) => void;
  onAdvance: (id: number, to: OrderStatus) => void;
  onCancel: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <ul className="flex flex-col gap-space-sm">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>
            <Skeleton className="h-36 rounded-[1.25rem]" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <p className="text-xs text-on-surface-variant">
        <span className="tabular-nums">{total}</span> đơn
      </p>
      <ul className="flex flex-col gap-space-sm">
        {orders.map((o) => (
          <li key={o.id} className="rounded-[1.25rem] bg-surface-container-lowest p-4 shadow-pod">
            <div className="flex items-center justify-between gap-space-sm">
              <button
                type="button"
                onClick={() => onOpen(o.id)}
                className="min-h-11 min-w-0 truncate text-left text-label-lg font-semibold tabular-nums text-on-surface"
              >
                {o.code}
              </button>
              <div className="-mr-2 flex shrink-0 items-center gap-1">
                <OrderStatusChip status={o.status} />
                <OrderRowMenu order={o} onOpen={onOpen} onCancel={onCancel} size="lg" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpen(o.id)}
              className={cn(
                "mt-space-xs flex w-full items-end justify-between gap-space-sm text-left",
                o.status === "cancelled" && "opacity-60",
              )}
            >
              <span className="min-w-0 text-body-md text-on-surface">{o.ship_recipient}</span>
              <span className="shrink-0 text-right">
                <span className="block text-label-lg font-semibold tabular-nums text-tertiary">
                  {formatVnd(o.total)}
                </span>
                <span className="block text-body-sm text-on-surface-variant">
                  {paymentShortLabel(o.payment_method)}
                </span>
              </span>
            </button>
            {NEXT_STEP[o.status] && (
              <div className="mt-space-sm border-t border-surface-container pt-space-sm">
                <OrderNextStepButton
                  order={o}
                  saving={savingId === o.id}
                  blocked={o.has_shortage}
                  onAdvance={onAdvance}
                  size="lg"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
