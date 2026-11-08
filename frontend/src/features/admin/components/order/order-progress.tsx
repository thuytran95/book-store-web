import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { formatDate, orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORDER_FLOW, ORDER_STATUS_UI } from "./order-meta";

type OrderStatus = components["schemas"]["OrderStatus"];
type StatusHistoryRead = components["schemas"]["StatusHistoryRead"];

/**
 * Admin order timeline (drawer "Tiến trình"): always vertical, shows the whole flow; a cancelled
 * order stops at the step it was cancelled from, followed by a "Đã hủy" row.
 */
export function OrderProgress({
  history,
  status,
  cancelledReason,
}: {
  history: StatusHistoryRead[];
  status: OrderStatus;
  cancelledReason?: string | null;
}) {
  const cancelRow =
    status === "cancelled" ? history.findLast((h) => h.to_status === "cancelled") : undefined;
  const stopAt =
    status === "cancelled"
      ? Math.max(0, ORDER_FLOW.indexOf(cancelRow?.from_status ?? "pending"))
      : ORDER_FLOW.indexOf(status);
  const at = (step: OrderStatus) =>
    step === "pending"
      ? (history.find((h) => h.to_status === "pending") ?? history[0])?.at
      : history.find((h) => h.to_status === step)?.at;

  return (
    <ol aria-label="Tiến trình đơn hàng" className="flex flex-col">
      {ORDER_FLOW.map((step, i) => {
        const done = i < stopAt || (i === stopAt && status === "completed");
        const current = i === stopAt && status !== "cancelled" && status !== "completed";
        const reached = i <= stopAt;
        const time = reached ? at(step) : undefined;
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className="relative flex gap-space-sm pb-space-md last:pb-0"
          >
            {i < ORDER_FLOW.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-0 left-3 top-6 w-0.5 -translate-x-1/2",
                  i < stopAt ? "bg-primary-container" : "bg-surface-container-high",
                )}
              />
            )}
            <span aria-hidden className="relative z-10 shrink-0">
              {done ? (
                <span className="grid size-6 place-items-center rounded-full bg-primary-container text-on-primary">
                  <MaterialIcon name="check" className="text-[16px]" />
                </span>
              ) : current ? (
                <span className="grid size-6 place-items-center rounded-full bg-surface-container-lowest ring-2 ring-primary">
                  <span className={cn("size-2.5 rounded-full", ORDER_STATUS_UI[step].dot)} />
                </span>
              ) : reached ? (
                <span className="grid size-6 place-items-center rounded-full bg-surface-container-high">
                  <span className="size-2 rounded-full bg-outline" />
                </span>
              ) : (
                <span className="block size-6 rounded-full border-2 border-dashed border-outline-variant bg-surface-container-lowest" />
              )}
            </span>
            <span className="pt-0.5">
              <span
                className={cn(
                  "block text-label-lg",
                  reached ? "text-on-surface" : "text-on-surface-variant/70",
                )}
              >
                {orderStatusLabel(step)}
              </span>
              {time && (
                <span className="block text-body-sm tabular-nums text-on-surface-variant">
                  {formatDate(time)}
                </span>
              )}
            </span>
          </li>
        );
      })}
      {status === "cancelled" && (
        <li aria-current="step" className="relative mt-space-md flex gap-space-sm">
          <span
            aria-hidden
            className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-destructive text-white"
          >
            <MaterialIcon name="close" className="text-[16px]" />
          </span>
          <span className="pt-0.5">
            <span className="block text-label-lg text-destructive">
              {orderStatusLabel("cancelled")}
            </span>
            {cancelRow && (
              <span className="block text-body-sm tabular-nums text-on-surface-variant">
                {formatDate(cancelRow.at)}
              </span>
            )}
            {cancelledReason && (
              <span className="mt-1 block text-body-md text-on-surface">“{cancelledReason}”</span>
            )}
          </span>
        </li>
      )}
    </ol>
  );
}
