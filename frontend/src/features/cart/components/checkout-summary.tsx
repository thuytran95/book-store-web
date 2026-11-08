"use client";

import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartItem } from "./cart-line";

const FAN = ["-rotate-6", "-rotate-2 translate-y-1", "rotate-3", "rotate-6 translate-y-1"];
const SPINES = ["bg-primary-fixed-dim", "bg-tertiary-container", "bg-pod-lavender", "bg-pod-sky"];

/** The buyer's books fanned out like the pile they're about to take home. */
function CoverFan({ items }: { items: CartItem[] }) {
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;
  return (
    <div aria-hidden className="flex h-32 items-end justify-center pt-2">
      {shown.map((i, idx) => (
        <div
          key={i.book.id}
          className={cn(
            "relative -mx-2.5 h-28 w-20 shrink-0 overflow-hidden rounded-book shadow-book ring-1 ring-black/10",
            FAN[idx],
            !i.book.cover_url && SPINES[idx],
          )}
          style={{ zIndex: idx }}
        >
          {i.book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={i.book.cover_url} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center p-2 text-center text-xs font-semibold text-primary">
              {i.book.title}
            </span>
          )}
        </div>
      ))}
      {extra > 0 && (
        <span className="relative z-10 -ml-1 mb-2 grid size-9 place-items-center rounded-full bg-secondary-container text-xs font-bold text-primary ring-2 ring-primary-container">
          +{extra}
        </span>
      )}
    </div>
  );
}

type Props = {
  items: CartItem[];
  total: number;
  count: number;
  /** Book the server rejected for stock; highlighted in the list. */
  flaggedBookId?: number;
  /** Error block / fix-it actions, shown above the button. */
  alert?: React.ReactNode;
  pending: boolean;
  disabled: boolean;
};

export function CheckoutSummary({ items, total, count, flaggedBookId, alert, pending, disabled }: Props) {
  return (
    <aside
      aria-labelledby="checkout-summary"
      className="h-fit rounded-serene-md bg-primary-container p-6 text-primary-foreground shadow-float md:sticky md:top-44"
    >
      <CoverFan items={items} />

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h2 id="checkout-summary" className="text-headline-md">
          Đơn của bạn
        </h2>
        <span className="text-body-sm text-on-primary-container">{count} cuốn</span>
      </div>

      <ul className="mt-3 grid gap-2.5 border-b border-white/10 pb-4">
        {items.map((i) => {
          const flagged = i.book.id === flaggedBookId;
          return (
            <li key={i.book.id} className="grid grid-cols-[1fr_auto] items-baseline gap-3 text-sm">
              <span className={cn("min-w-0", flagged && "text-red-300")}>
                <span className="line-clamp-1">{i.book.title}</span>
                {i.quantity > 1 && (
                  <span className="text-body-sm text-on-primary-container">
                    {i.quantity} × {formatVnd(i.book.price)}
                  </span>
                )}
              </span>
              <span className="tabular-nums text-primary-fixed">{formatVnd(i.line_total)}</span>
            </li>
          );
        })}
      </ul>

      <dl className="grid gap-1.5 py-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-on-primary-container">Tiền sách</dt>
          <dd className="tabular-nums">{formatVnd(total)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-on-primary-container">Phí vận chuyển</dt>
          <dd>Cửa hàng báo khi xác nhận</dd>
        </div>
      </dl>

      <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-sm text-on-primary-container">Tạm tính</span>
        <span className="text-[28px] leading-none font-bold tracking-tight text-secondary-container tabular-nums">
          {formatVnd(total)}
        </span>
      </div>

      {alert && <div className="mt-5 grid gap-3 rounded-serene bg-white p-4 text-on-surface">{alert}</div>}

      <button
        type="submit"
        disabled={disabled || pending}
        className="mt-5 hidden w-full items-center justify-center rounded-full bg-secondary-container px-6 py-3.5 text-base font-semibold text-primary transition-[filter,opacity] hover:brightness-105 focus-visible:ring-3 focus-visible:ring-secondary-container/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-container focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:flex"
      >
        {pending ? "Đang đặt hàng…" : "Đặt hàng"}
      </button>
      <p className="mt-3 hidden text-center text-body-sm text-on-primary-container md:block">
        Sau khi đặt, bạn theo dõi đơn trong mục Đơn hàng.
      </p>
    </aside>
  );
}

/** Mobile-only bar so the total and the button are always reachable. */
export function CheckoutMobileBar({ total, pending, disabled }: { total: number; pending: boolean; disabled: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/60 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-page items-center gap-4">
        <div className="grid">
          <span className="text-body-sm text-on-surface-variant">Tạm tính</span>
          <span className="text-lg font-bold text-primary tabular-nums">{formatVnd(total)}</span>
        </div>
        <button
          type="submit"
          disabled={disabled || pending}
          className="ml-auto inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          {pending ? "Đang đặt hàng…" : "Đặt hàng"}
        </button>
      </div>
    </div>
  );
}
