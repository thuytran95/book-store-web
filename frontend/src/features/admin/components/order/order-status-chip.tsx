import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_UI } from "./order-meta";

type OrderStatus = components["schemas"]["OrderStatus"];

export function OrderStatusChip({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const ui = ORDER_STATUS_UI[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ui.chip,
        className,
      )}
    >
      <MaterialIcon name={ui.icon} className="text-[16px]" />
      {orderStatusLabel(status)}
    </span>
  );
}
