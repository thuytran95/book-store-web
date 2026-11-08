import type { components } from "@/lib/api/schema";

type OrderStatus = components["schemas"]["OrderStatus"];

/** The happy path in order; `cancelled` stands apart. */
export const ORDER_FLOW: OrderStatus[] = ["pending", "confirmed", "shipping", "completed"];

/**
 * Colours / icon per status (labels come from `orderStatusLabel` in `lib/format.ts`).
 * Prototype tokens mapped as in admin-inventory: error → destructive, tertiary-fixed → pod-honey,
 * tertiary-fixed-dim → tertiary-container, on-tertiary-fixed → tertiary.
 */
export const ORDER_STATUS_UI: Record<OrderStatus, { dot: string; chip: string; icon: string }> = {
  pending: { dot: "bg-tertiary-container", chip: "bg-pod-honey text-tertiary", icon: "hourglass_top" },
  confirmed: { dot: "bg-primary-container", chip: "bg-primary-fixed/70 text-primary", icon: "inventory" },
  shipping: {
    dot: "bg-secondary",
    chip: "bg-secondary-container/70 text-on-secondary-container",
    icon: "local_shipping",
  },
  completed: {
    dot: "bg-outline",
    chip: "bg-surface-container-high text-on-surface-variant",
    icon: "task_alt",
  },
  cancelled: { dot: "bg-destructive", chip: "bg-destructive/10 text-destructive", icon: "block" },
};

export type NextStep = {
  to: OrderStatus;
  /** Button text, same in row, card and drawer. */
  label: string;
  /** Success toast. */
  done: (code: string, copies: number) => string;
  icon: string;
};

export const NEXT_STEP: Partial<Record<OrderStatus, NextStep>> = {
  pending: {
    to: "confirmed",
    label: "Xác nhận",
    done: (code, copies) => `Đã xác nhận đơn ${code}, đã trừ ${copies} bản khỏi kho`,
    icon: "check",
  },
  confirmed: {
    to: "shipping",
    label: "Giao cho shipper",
    done: (code) => `Đã giao cho shipper đơn ${code}`,
    icon: "local_shipping",
  },
  shipping: {
    to: "completed",
    label: "Đã giao xong",
    done: (code) => `Đã hoàn thành đơn ${code}`,
    icon: "task_alt",
  },
};

/** Mirrors `orders/state_machine.py` (admin): every non-final status can be cancelled. */
export const CAN_CANCEL: Record<OrderStatus, boolean> = {
  pending: true,
  confirmed: true,
  shipping: true,
  completed: false,
  cancelled: false,
};

/**
 * Next step for an order. With `allowed` (detail's `allowed_transitions`) the step is shown only
 * when the server allows it; without it (list rows) the state machine above decides.
 */
export function nextStepFor(status: OrderStatus, allowed?: OrderStatus[]): NextStep | undefined {
  const step = NEXT_STEP[status];
  if (!step) return undefined;
  return !allowed || allowed.includes(step.to) ? step : undefined;
}

export const CANCEL_PRESETS = [
  "Người mua yêu cầu hủy",
  "Không liên lạc được người mua",
  "Sách không đúng tình trạng mô tả",
  "Giao hàng không thành công",
] as const;
