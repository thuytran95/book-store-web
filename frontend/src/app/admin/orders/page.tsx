import type { Metadata } from "next";
import { OrdersTable } from "@/features/admin/components/order/orders-table";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function AdminOrdersPage() {
  return <OrdersTable />;
}
