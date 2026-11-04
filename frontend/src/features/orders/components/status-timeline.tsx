import { Check, XCircle } from "lucide-react";
import type { components } from "@/lib/api/schema";
import { formatDate, orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderStatus = components["schemas"]["OrderStatus"];

const STEPS: OrderStatus[] = ["pending", "confirmed", "shipping", "completed"];

type Props = {
  history: { status: OrderStatus; at: string }[];
  current: OrderStatus;
  cancelledReason?: string | null;
};

/** Vertical on mobile, horizontal from `sm`. Cancelled is a distinct end state. */
export function StatusTimeline({ history, current, cancelledReason }: Props) {
  const at = (s: OrderStatus) => history.find((h) => h.status === s)?.at;

  if (current === "cancelled") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <XCircle className="mt-0.5 size-5 text-destructive" />
        <div className="text-sm">
          <p className="font-medium text-destructive">{orderStatusLabel("cancelled")}</p>
          {at("cancelled") && <p className="text-muted-foreground">{formatDate(at("cancelled")!)}</p>}
          {cancelledReason && <p className="mt-1">Lý do: {cancelledReason}</p>}
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(current);
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0" aria-label="Tiến trình đơn hàng">
      {STEPS.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <li
            key={s}
            aria-current={i === currentIdx ? "step" : undefined}
            className="relative flex gap-3 sm:flex-1 sm:flex-col sm:items-center sm:text-center"
          >
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-8 left-4 h-[calc(100%-1rem)] w-0.5 -translate-x-1/2 sm:top-4 sm:left-1/2 sm:h-0.5 sm:w-full",
                  i < currentIdx ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 bg-background text-xs",
                done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span className="grid text-sm sm:mt-2">
              <span className={done ? "font-medium" : "text-muted-foreground"}>{orderStatusLabel(s)}</span>
              {at(s) && <span className="text-xs text-muted-foreground">{formatDate(at(s)!)}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
