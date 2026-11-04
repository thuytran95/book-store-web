import type { Metadata } from "next";
import { OrderList } from "@/features/orders/components/order-list";

export const metadata: Metadata = { title: "Đơn hàng của tôi" };

export default function OrdersPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      <OrderList />
    </div>
  );
}
