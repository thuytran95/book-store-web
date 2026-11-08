import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersPage } from "@/features/admin/components/order/orders-page";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
