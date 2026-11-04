import type { components } from "@/lib/api/schema";
import { conditionLabel, formatVnd, orderStatusColor, orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderStatus = components["schemas"]["OrderStatus"];

const SIZES = { sm: "text-sm", md: "text-base", lg: "text-2xl font-semibold" } as const;

export function PriceTag({
  amount,
  size = "md",
  strike,
  className,
}: {
  amount: number;
  size?: keyof typeof SIZES;
  /** Original price shown struck through. */
  strike?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-primary tabular-nums", SIZES[size])}>
        {formatVnd(amount)}
      </span>
      {strike !== undefined && strike > amount && (
        <span className="text-sm text-muted-foreground line-through tabular-nums">
          {formatVnd(strike)}
        </span>
      )}
    </span>
  );
}

function conditionTone(pct: number): string {
  if (pct >= 90) return "bg-green-100 text-green-800";
  if (pct >= 70) return "bg-lime-100 text-lime-800";
  if (pct >= 50) return "bg-amber-100 text-amber-800";
  return "bg-orange-100 text-orange-800";
}

export function ConditionBadge({ pct, className }: { pct: number; className?: string }) {
  return (
    <span
      title={conditionLabel(pct)}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        conditionTone(pct),
        className,
      )}
    >
      {pct}% · {conditionLabel(pct)}
    </span>
  );
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        orderStatusColor(status),
        className,
      )}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
