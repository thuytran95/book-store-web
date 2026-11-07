"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { STOCK_TABS, type StockTab } from "../../inventory/types";

type InventoryOverview = components["schemas"]["InventoryOverview"];

const PENDING_HREF = "/admin/orders?status=pending";

const SEGMENTS: { key: Exclude<StockTab, "">; className: string }[] = [
  { key: "in_stock", className: "bg-secondary" },
  { key: "out_of_stock", className: "bg-destructive" },
  { key: "hidden", className: "bg-outline-variant" },
];

function countFor(o: InventoryOverview, tab: StockTab): number {
  switch (tab) {
    case "in_stock":
      return o.in_stock_titles;
    case "out_of_stock":
      return o.out_of_stock_titles;
    case "hidden":
      return o.hidden_titles;
    default:
      return o.total_titles;
  }
}

export function InventoryStatusStrip({
  overview,
  isLoading,
  status,
  onStatusChange,
}: {
  overview: InventoryOverview | undefined;
  isLoading: boolean;
  status: StockTab;
  onStatusChange: (s: StockTab) => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ready = !isLoading && overview !== undefined;
  const pending = overview?.pending_orders ?? 0;

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = STOCK_TABS.length;
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    onStatusChange(STOCK_TABS[next].value);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-label="Tình trạng kho" className="flex flex-col gap-space-sm">
      {ready && pending > 0 && (
        <Link
          href={PENDING_HREF}
          className="flex items-center justify-between rounded-full bg-pod-honey px-space-md py-2.5 text-body-md text-tertiary md:hidden"
        >
          <span className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-tertiary-container" />
            <b className="font-semibold">{pending}</b> đơn chờ xác nhận
          </span>
          <MaterialIcon name="chevron_right" className="text-[20px]" />
        </Link>
      )}

      <div className="flex flex-col gap-space-md md:flex-row">
        <div className="min-w-0 flex-1 rounded-lg md:bg-surface-container-lowest md:p-space-sm md:shadow-pod">
          <div
            role="tablist"
            aria-label="Lọc theo trạng thái"
            className="-mx-1 flex snap-x gap-space-xs overflow-x-auto px-1 pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
          >
            {STOCK_TABS.map((tab, i) => {
              const selected = status === tab.value;
              const n = overview ? countFor(overview, tab.value) : 0;
              return (
                <button
                  key={tab.value || "all"}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onStatusChange(tab.value)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-space-md py-2 text-left transition-colors md:min-h-[72px] md:flex-col md:items-start md:gap-1 md:rounded-[1.25rem] md:py-space-sm",
                    selected
                      ? "bg-surface-container-low ring-2 ring-inset ring-primary"
                      : "bg-surface-container-lowest shadow-pod hover:bg-surface-container-low md:shadow-none",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-label-md font-semibold uppercase tracking-wide",
                      selected ? "text-primary" : "text-on-surface-variant",
                    )}
                  >
                    {tab.dot && <span className={cn("size-2 rounded-full", tab.dot)} />}
                    {tab.label}
                  </span>
                  {ready ? (
                    <span
                      className={cn(
                        "text-label-lg font-semibold tabular-nums md:text-headline-md",
                        tab.value === "out_of_stock" && n > 0
                          ? "text-destructive"
                          : selected
                            ? "text-primary"
                            : "text-on-surface",
                      )}
                    >
                      {n}
                    </span>
                  ) : (
                    <Skeleton className="h-5 w-8 rounded md:h-7 md:w-10" />
                  )}
                </button>
              );
            })}
          </div>
          <RatioBar overview={ready ? overview : undefined} status={status} />
        </div>

        <Link
          href={PENDING_HREF}
          aria-label={`${pending} đơn chờ xác nhận, mở trang Đơn hàng`}
          className={cn(
            "hidden shrink-0 flex-col justify-between gap-space-xs rounded-lg p-space-md transition-colors md:flex md:w-56 lg:w-64",
            ready && pending > 0
              ? "bg-pod-honey hover:bg-pod-honey/70"
              : "bg-surface-container-low opacity-70 hover:opacity-100",
          )}
        >
          <span className="flex items-start justify-between gap-2 text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
            Đơn chờ xác nhận
            <span className="flex items-center gap-0.5 normal-case tracking-normal text-primary">
              Xem <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "text-headline-md font-semibold tabular-nums",
                pending > 0 ? "text-tertiary" : "text-on-surface-variant",
              )}
            >
              {ready ? pending : "—"}
            </span>
            {ready && pending > 0 && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-tertiary-container opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-tertiary-container" />
              </span>
            )}
          </span>
        </Link>
      </div>
    </section>
  );
}

/** Three mutually exclusive segments that add up to "Tất cả"; grows in from 0 on first data. */
function RatioBar({
  overview,
  status,
}: {
  overview: InventoryOverview | undefined;
  status: StockTab;
}) {
  const [grown, setGrown] = useState(false);
  const hasData = overview !== undefined && overview.total_titles > 0;

  useEffect(() => {
    if (!hasData || grown) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(id);
  }, [hasData, grown]);

  return (
    <div aria-hidden className="mt-space-sm hidden h-1.5 gap-1 px-1 md:flex">
      {hasData ? (
        SEGMENTS.map((seg) => {
          const n = countFor(overview, seg.key);
          const label = STOCK_TABS.find((t) => t.value === seg.key)?.label;
          return (
            <span
              key={seg.key}
              title={`${label}: ${n}`}
              className={cn("h-full rounded-full transition-all duration-700", seg.className)}
              style={{
                flexGrow: grown ? n : 0,
                flexBasis: 0,
                minWidth: grown && n > 0 ? 6 : 0,
                opacity: status && status !== seg.key ? 0.35 : 1,
              }}
            />
          );
        })
      ) : (
        <span className="h-full flex-1 rounded-full bg-surface-container" />
      )}
    </div>
  );
}
