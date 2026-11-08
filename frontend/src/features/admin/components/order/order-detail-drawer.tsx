"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { hasCode } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";
import { formatDate, formatStockCode, formatVnd, paymentLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAdminOrder } from "../../hooks/use-admin";
import { nextStepFor } from "./order-meta";
import { OrderProgress } from "./order-progress";
import { OrderNextStepButton } from "./order-row-actions";
import { OrderStatusChip } from "./order-status-chip";

type OrderDetail = components["schemas"]["OrderDetail"];
type OrderStatus = components["schemas"]["OrderStatus"];

const CARD = "rounded-lg bg-surface-container-lowest p-space-md shadow-pod";

/** Right-side order detail (`?order={id}`). Data stays in place after a transition. */
export function OrderDetailDrawer({
  orderId,
  onClose,
  onAdvance,
  onCancel,
  savingId,
}: {
  orderId: number | null;
  onClose: () => void;
  onAdvance: (id: number, to: OrderStatus) => void;
  onCancel: (id: number) => void;
  savingId: number | null;
}) {
  // Keep the last id so the content doesn't vanish during the close animation.
  const [shownId, setShownId] = useState(orderId);
  if (orderId && orderId !== shownId) setShownId(orderId);
  const { data: order, isLoading, error, refetch } = useAdminOrder(shownId);

  return (
    <Sheet open={orderId != null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "gap-0 border-0 bg-surface p-0",
          "data-[side=right]:w-full data-[side=right]:sm:w-[min(100vw,520px)] data-[side=right]:sm:max-w-none sm:rounded-l-[2rem]",
          "duration-[220ms] ease-[cubic-bezier(.2,.7,.2,1)] data-[side=right]:data-starting-style:translate-x-6 data-[side=right]:data-ending-style:translate-x-6 motion-reduce:transition-none",
        )}
      >
        {isLoading || (!order && !error) ? (
          <DrawerSkeleton />
        ) : error && !order ? (
          <div className="flex flex-1 flex-col">
            <DrawerTop onClose={onClose}>
              <SheetTitle className="text-headline-md text-on-surface">Chi tiết đơn</SheetTitle>
            </DrawerTop>
            <div className="p-space-lg">
              {hasCode(error, "NOT_FOUND") ? (
                <EmptyState
                  title="Không tìm thấy đơn"
                  action={
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-10 rounded-full bg-surface-container-low px-space-lg text-label-lg text-primary hover:bg-surface-container"
                    >
                      Đóng
                    </button>
                  }
                />
              ) : (
                <div className="flex flex-col items-start gap-space-sm">
                  <ErrorMessage error={error} />
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="min-h-10 rounded-full bg-primary px-space-lg text-label-lg text-on-primary"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : order ? (
          <DrawerBody
            order={order}
            onClose={onClose}
            onAdvance={onAdvance}
            onCancel={onCancel}
            saving={savingId === order.id}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DrawerTop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-space-md bg-surface-container-lowest px-space-lg pb-space-md pt-space-lg">
      <div className="min-w-0">{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng chi tiết"
        className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface-container-low"
      >
        <MaterialIcon name="close" />
      </button>
    </header>
  );
}

function DrawerBody({
  order: o,
  onClose,
  onAdvance,
  onCancel,
  saving,
}: {
  order: OrderDetail;
  onClose: () => void;
  onAdvance: (id: number, to: OrderStatus) => void;
  onCancel: (id: number) => void;
  saving: boolean;
}) {
  const copies = o.items.reduce((n, i) => n + i.quantity, 0);
  const firstShort = o.status === "pending" ? o.items.find((i) => i.short) : undefined;
  const blocked = firstShort !== undefined;
  const next = nextStepFor(o.status, o.allowed_transitions);
  const canCancel = o.allowed_transitions.includes("cancelled");
  const stockNote =
    o.status === "pending" ? (
      <>
        Xác nhận sẽ trừ <b className="tabular-nums">{copies}</b> bản khỏi tồn kho.
      </>
    ) : o.status === "confirmed" || o.status === "shipping" ? (
      <>
        Đã trừ <b className="tabular-nums">{copies}</b> bản khỏi kho. Hủy đơn sẽ hoàn lại.
      </>
    ) : null;

  return (
    <>
      <DrawerTop onClose={onClose}>
        <div className="flex flex-wrap items-center gap-space-sm">
          <SheetTitle className="text-2xl font-bold tabular-nums text-primary">{o.code}</SheetTitle>
          <OrderStatusChip status={o.status} />
        </div>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Đặt lúc <span className="tabular-nums">{formatDate(o.created_at)}</span>
          {o.user_email && <> bởi {o.user_email}</>}
        </p>
      </DrawerTop>

      <div className="flex flex-1 flex-col gap-space-lg overflow-y-auto p-space-lg">
        {firstShort && (
          <div
            role="alert"
            className="flex gap-space-sm rounded-[1.25rem] bg-destructive/10 px-space-md py-3 text-body-md text-destructive"
          >
            <MaterialIcon name="warning" className="mt-0.5 text-[18px]" />
            <span>
              Có sách trong đơn đã hết bản trong kho nên chưa thể xác nhận. Hãy hủy đơn hoặc bổ sung
              tồn kho.{" "}
              <Link
                href={`/admin?q=${encodeURIComponent(formatStockCode(firstShort.book_id))}`}
                className="font-semibold underline"
              >
                Mở kho sách
              </Link>
            </span>
          </div>
        )}

        <section aria-labelledby="order-ship" className={CARD}>
          <h3 id="order-ship" className="mb-space-sm text-headline-sm text-on-surface">
            Giao tới
          </h3>
          <p className="text-label-lg">{o.ship_recipient}</p>
          <p className="flex items-center gap-1 text-body-md tabular-nums text-on-surface-variant">
            {o.ship_phone}
            <a
              href={`tel:${o.ship_phone.replace(/\s/g, "")}`}
              className="ml-1 inline-flex items-center gap-0.5 text-label-md text-primary hover:underline"
            >
              <MaterialIcon name="call" className="text-[16px]" />
              Gọi
            </a>
          </p>
          <p className="mt-1 text-body-md text-on-surface">{o.ship_address}</p>
          {o.note && (
            <p className="mt-space-sm flex gap-1 rounded-[1rem] bg-pod-honey px-space-md py-2 text-body-md text-tertiary">
              <MaterialIcon name="sticky_note_2" className="mt-0.5 text-[16px]" />
              <span>{o.note}</span>
            </p>
          )}
        </section>

        <section aria-labelledby="order-items" className={CARD}>
          <h3 id="order-items" className="mb-space-xs text-headline-sm text-on-surface">
            Sách trong đơn{" "}
            <span className="font-normal tabular-nums text-on-surface-variant">({copies})</span>
          </h3>
          <ul className="divide-y divide-surface-container">
            {o.items.map((i) => (
              <li key={i.book_id} className="flex items-start justify-between gap-space-md py-space-sm">
                <span className="min-w-0">
                  <Link
                    href={`/admin/books/${i.book_id}`}
                    className="block text-label-lg text-on-surface hover:text-primary hover:underline"
                  >
                    {i.title}
                  </Link>
                  <span className="block text-body-sm text-on-surface-variant">
                    {i.author ? `${i.author} · ` : ""}tình trạng{" "}
                    <span className="tabular-nums">{i.condition_pct}%</span>
                    {i.quantity > 1 && (
                      <>
                        {" · "}
                        <span className="tabular-nums">{i.quantity}</span> bản
                      </>
                    )}
                  </span>
                  {i.short && o.status === "pending" && (
                    <span className="mt-0.5 inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-label-sm text-destructive">
                      Hết bản trong kho
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap text-label-lg tabular-nums">
                  {formatVnd(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-space-xs grid grid-cols-[1fr_auto] gap-y-1 border-t border-surface-container pt-space-sm text-body-md">
            <dt className="text-on-surface-variant">Tạm tính</dt>
            <dd className="text-right tabular-nums">{formatVnd(o.subtotal)}</dd>
            <dt className="text-on-surface-variant">Phí giao hàng</dt>
            <dd className="text-right tabular-nums">{formatVnd(o.shipping_fee)}</dd>
            <dt className="pt-1 text-label-lg font-semibold">Tổng thu</dt>
            <dd className="pt-0.5 text-right text-headline-md font-bold tabular-nums text-tertiary">
              {formatVnd(o.total)}
            </dd>
            <dt className="text-on-surface-variant">Thanh toán</dt>
            <dd className="text-right">{paymentLabel(o.payment_method)}</dd>
          </dl>
        </section>

        <section aria-labelledby="order-flow" className={CARD}>
          <h3 id="order-flow" className="mb-space-md text-headline-sm text-on-surface">
            Tiến trình
          </h3>
          <OrderProgress history={o.history} status={o.status} cancelledReason={o.cancelled_reason} />
        </section>
      </div>

      {(next || canCancel) && (
        <footer className="flex shrink-0 flex-col gap-space-sm bg-surface-container-lowest px-space-lg py-space-md shadow-[0_-1px_12px_rgba(27,77,62,0.06)]">
          {blocked ? (
            <p className="flex items-center gap-1 text-body-sm text-destructive">
              <MaterialIcon name="block" className="text-[16px]" />
              <span>Không thể xác nhận khi còn sách thiếu hàng.</span>
            </p>
          ) : (
            stockNote && (
              <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                <MaterialIcon name="inventory_2" className="text-[16px]" />
                <span>{stockNote}</span>
              </p>
            )
          )}
          <div className="flex items-center gap-space-sm">
            {canCancel && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onCancel(o.id)}
                className="min-h-11 shrink-0 rounded-full px-space-lg text-label-lg font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                Hủy đơn
              </button>
            )}
            {next && (
              <div className="flex-1">
                <OrderNextStepButton
                  order={o}
                  saving={saving}
                  blocked={blocked}
                  onAdvance={onAdvance}
                  size="lg"
                />
              </div>
            )}
          </div>
        </footer>
      )}
    </>
  );
}

function DrawerSkeleton() {
  return (
    <div aria-busy className="flex flex-1 flex-col">
      <SheetTitle className="sr-only">Đang tải đơn hàng</SheetTitle>
      <div className="space-y-2 bg-surface-container-lowest px-space-lg pb-space-md pt-space-lg">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>
      <div className="flex flex-col gap-space-lg p-space-lg">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </div>
  );
}
