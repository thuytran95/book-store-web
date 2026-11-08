"use client";

import { useEffect, useId, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { CAN_CANCEL, NEXT_STEP } from "./order-meta";

type OrderStatus = components["schemas"]["OrderStatus"];

const BLOCKED_HINT =
  "Có sách trong đơn đã hết bản trong kho. Mở chi tiết để hủy đơn hoặc bổ sung tồn kho.";

function Spinner() {
  return (
    <span
      aria-label="Đang lưu"
      className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

/** One-click "next step" for an order (no confirm; only cancel asks). */
export function OrderNextStepButton({
  order,
  saving,
  blocked = false,
  onAdvance,
  size = "sm",
}: {
  order: { id: number; code: string; status: OrderStatus };
  saving: boolean;
  /** Pending order with a line short of stock: confirm would fail with OUT_OF_STOCK. */
  blocked?: boolean;
  onAdvance: (id: number, to: OrderStatus) => void;
  size?: "sm" | "lg";
}) {
  const hintId = useId();
  const step = NEXT_STEP[order.status];
  if (!step) {
    return (
      <span className="text-body-sm text-on-surface-variant">
        {order.status === "completed" ? "Đã xong" : "Không còn thao tác"}
      </span>
    );
  }
  const primary = order.status === "pending";
  const isBlocked = primary && blocked;
  return (
    <>
      <button
        type="button"
        disabled={saving || isBlocked}
        title={isBlocked ? BLOCKED_HINT : undefined}
        aria-describedby={isBlocked ? hintId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onAdvance(order.id, step.to);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-label-lg font-semibold transition-colors",
          size === "lg" ? "min-h-11 w-full px-space-lg" : "min-h-9 px-space-md",
          primary
            ? "bg-primary-container text-on-primary hover:bg-primary"
            : "bg-surface-container-low text-primary hover:bg-surface-container",
          isBlocked ? "cursor-not-allowed disabled:opacity-50" : "disabled:opacity-60",
        )}
      >
        {saving ? (
          <Spinner />
        ) : (
          <MaterialIcon name={isBlocked ? "inventory_2" : step.icon} className="text-[18px]" />
        )}
        {step.label}
      </button>
      {isBlocked && (
        <span id={hintId} className="sr-only">
          {BLOCKED_HINT}
        </span>
      )}
    </>
  );
}

/** ⋯ menu: view details, call the recipient, cancel (while the order is still open). */
export function OrderRowMenu({
  order,
  onOpen,
  onCancel,
  size = "sm",
}: {
  order: { id: number; code: string; status: OrderStatus; ship_phone: string };
  onOpen: (id: number) => void;
  onCancel: (id: number) => void;
  size?: "sm" | "lg";
}) {
  const [open, setOpen] = useState(false);

  // Scrolling the page closes the menu (it is anchored to a row that moves away).
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);

  return (
    // Keep clicks inside the menu from reaching a clickable row/card.
    <span className="contents" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          aria-label={`Thao tác khác cho đơn ${order.code}`}
          className={cn(
            "grid place-items-center rounded-full text-on-surface-variant outline-none hover:bg-surface-container focus-visible:ring-3 focus-visible:ring-ring/50",
            size === "lg" ? "size-11" : "size-8",
          )}
        >
          <MaterialIcon name="more_horiz" className="text-[20px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onClick={() => onOpen(order.id)}>
            <MaterialIcon name="receipt_long" className="text-[18px] text-on-surface-variant" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={`tel:${order.ship_phone.replace(/\s/g, "")}`} />}>
            <MaterialIcon name="call" className="text-[18px] text-on-surface-variant" />
            Gọi người nhận
          </DropdownMenuItem>
          {CAN_CANCEL[order.status] && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onCancel(order.id)}>
                <MaterialIcon name="block" className="text-[18px]" />
                Hủy đơn
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
