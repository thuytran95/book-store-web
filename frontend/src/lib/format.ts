import type { components } from "./api/schema";

type OrderStatus = components["schemas"]["OrderStatus"];

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });
const dayFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export function formatVnd(amount: number | string): string {
  return vnd.format(Number(amount));
}

export function formatDate(value: string | Date, withTime = true): string {
  return (withTime ? dateFmt : dayFmt).format(typeof value === "string" ? new Date(value) : value);
}

/** Human label for a 10-100 condition percentage. */
export function conditionLabel(pct: number): string {
  if (pct >= 95) return "Như mới";
  if (pct >= 85) return "Rất tốt";
  if (pct >= 70) return "Tốt";
  if (pct >= 50) return "Khá";
  return "Cũ";
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

/** Tailwind classes (bg + text) per status, for badges. */
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipping: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const orderStatusLabel = (s: OrderStatus): string => STATUS_LABEL[s];
export const orderStatusColor = (s: OrderStatus): string => STATUS_COLOR[s];

type PaymentMethod = components["schemas"]["PaymentMethod"];

export function paymentLabel(method: PaymentMethod): string {
  return method === "cod" ? "Thu tiền khi giao (COD)" : "Chuyển khoản";
}

/** Short form for table columns: "COD" / "Chuyển khoản". */
export function paymentShortLabel(method: PaymentMethod): string {
  return method === "cod" ? "COD" : "Chuyển khoản";
}

/** Admin stock code shown in inventory UI (until a dedicated column exists). */
export function formatStockCode(bookId: number): string {
  return `MS-${String(bookId).padStart(5, "0")}`;
}

export type ConditionBand = "mint" | "good" | "fair" | "vintage";

export function conditionBand(pct: number): ConditionBand {
  if (pct >= 95) return "mint";
  if (pct >= 80) return "good";
  if (pct >= 60) return "fair";
  return "vintage";
}

const BAND_LABEL: Record<ConditionBand, string> = {
  mint: "Rất mới",
  good: "Tốt",
  fair: "Khá",
  vintage: "Hiếm",
};

/** Prototype-style label including percentage, e.g. "Tốt (85%)". */
export function conditionBandLabel(pct: number): string {
  const band = conditionBand(pct);
  return `${BAND_LABEL[band]} (${pct}%)`;
}

export function formatCompactCount(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}
