import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";

type OrderStatusCounts = components["schemas"]["OrderStatusCounts"];

export function OrdersHeader({
  counts,
  isLoading,
  onShowStale,
}: {
  counts: OrderStatusCounts | undefined;
  isLoading: boolean;
  onShowStale: () => void;
}) {
  return (
    <section className="space-y-1">
      <h1 className="text-headline-xl tracking-tight text-primary">Đơn hàng</h1>
      {isLoading || !counts ? (
        <Skeleton className="h-5 w-56 rounded-full" />
      ) : (
        <p className="flex flex-wrap items-center gap-x-space-sm gap-y-1 text-body-md text-on-surface-variant">
          <span>
            <b className="font-semibold tabular-nums text-on-surface">{counts.all}</b> đơn
            {" · "}
            <b className="font-semibold tabular-nums text-on-surface">{counts.pending}</b> đang chờ
            bạn xác nhận
          </span>
          {counts.stale_pending > 0 && (
            <button
              type="button"
              onClick={onShowStale}
              className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-2 py-0.5 text-label-sm text-destructive hover:bg-destructive/15"
            >
              <MaterialIcon name="schedule" className="text-[16px]" />
              <span className="tabular-nums">{counts.stale_pending}</span> đơn chờ hơn 1 ngày
            </button>
          )}
        </p>
      )}
    </section>
  );
}
