"use client";

import { Fragment, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORDER_FLOW, ORDER_STATUS_UI } from "./order-meta";

type OrderStatus = components["schemas"]["OrderStatus"];
type OrderStatusCounts = components["schemas"]["OrderStatusCounts"];
type TabKey = OrderStatus | "";

/** Tab order = keyboard order: all, the four process steps, cancelled. */
const KEYS: TabKey[] = ["", ...ORDER_FLOW, "cancelled"];

function subLabel(key: TabKey, c: OrderStatusCounts) {
  switch (key) {
    case "pending":
      if (c.stale_pending > 0) {
        return <span className="font-medium text-destructive">{c.stale_pending} quá 1 ngày</span>;
      }
      return c.pending > 0 ? "cần xử lý" : null;
    case "confirmed":
      return c.confirmed > 0 ? "chờ đóng gói" : null;
    case "shipping":
      return c.shipping > 0 ? "đang trên đường" : null;
    default:
      return null;
  }
}

/** Desktop-only separator before tab `index`: a divider around all/cancelled, › inside the flow. */
function Separator({ index }: { index: number }) {
  if (index === 0) return null;
  const divider = index === 1 || index === KEYS.length - 1;
  return (
    <span aria-hidden className="hidden place-items-center px-1 md:grid">
      {divider ? (
        <span className="h-10 w-px bg-surface-container-high" />
      ) : (
        <MaterialIcon name="chevron_right" className="text-[20px] text-outline-variant" />
      )}
    </span>
  );
}

export function OrdersStatusPipeline({
  counts,
  isLoading,
  status,
  onStatusChange,
}: {
  counts: OrderStatusCounts | undefined;
  isLoading: boolean;
  status: TabKey;
  onStatusChange: (s: TabKey) => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ready = !isLoading && counts !== undefined;

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = KEYS.length;
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    onStatusChange(KEYS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Lọc theo trạng thái đơn"
      className={cn(
        "-mx-1 flex snap-x gap-space-xs overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "md:mx-0 md:grid md:gap-0 md:overflow-visible md:rounded-lg md:bg-surface-container-lowest md:p-space-sm md:shadow-pod",
        "md:grid-cols-[minmax(0,.8fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,.8fr)]",
      )}
    >
      {KEYS.map((key, i) => {
        const selected = status === key;
        const n = counts ? (key === "" ? counts.all : counts[key]) : 0;
        const hot = key === "pending" && n > 0 && !selected;
        const ui = key ? ORDER_STATUS_UI[key] : undefined;
        const sub = ready && counts ? subLabel(key, counts) : null;
        return (
          <Fragment key={key || "all"}>
            <Separator index={i} />
            <button
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onStatusChange(key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-space-md py-2 text-left transition-colors",
                "md:min-h-[76px] md:min-w-0 md:flex-col md:items-start md:gap-1 md:rounded-[1.25rem] md:py-space-sm",
                selected
                  ? "bg-surface-container-low ring-2 ring-inset ring-primary"
                  : hot
                    ? "bg-pod-honey/40 shadow-pod hover:bg-pod-honey/70 md:shadow-none"
                    : "bg-surface-container-lowest shadow-pod hover:bg-surface-container-low md:shadow-none",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold",
                  selected ? "text-primary" : hot ? "text-tertiary" : "text-on-surface-variant",
                )}
              >
                {ui && <span className={cn("size-2 rounded-full", ui.dot)} />}
                {key ? orderStatusLabel(key) : "Tất cả"}
              </span>
              <span className="flex min-w-0 items-baseline gap-2">
                {ready ? (
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums md:text-2xl md:font-bold",
                      selected
                        ? "text-primary"
                        : hot
                          ? "text-tertiary"
                          : key === "cancelled"
                            ? "text-on-surface-variant"
                            : "text-on-surface",
                    )}
                  >
                    {n}
                  </span>
                ) : (
                  <Skeleton className="h-4 w-8 rounded-full md:h-8 md:w-12" />
                )}
                {sub && (
                  <span className="hidden truncate text-body-sm text-on-surface-variant md:block">
                    {sub}
                  </span>
                )}
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
