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
type ReservationStatus = components["schemas"]["ReservationStatus"];
type BookRequestStatus = components["schemas"]["BookRequestStatus"];

export function paymentLabel(method: PaymentMethod): string {
  return method === "cod" ? "COD (khi nhận hàng)" : "Chuyển khoản";
}

const RESERVATION_LABEL: Record<ReservationStatus, string> = {
  active: "Đang giữ",
  converted: "Đã mua",
  cancelled: "Đã huỷ",
  expired: "Hết hạn",
};

export const reservationStatusLabel = (s: ReservationStatus): string => RESERVATION_LABEL[s];

const REQUEST_LABEL: Record<BookRequestStatus, string> = {
  pending: "Chờ xử lý",
  available: "Đã có sách",
  rejected: "Từ chối",
};

export const requestStatusLabel = (s: BookRequestStatus): string => REQUEST_LABEL[s];
