import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetail } from "@/features/orders/components/order-detail";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

export default function OrderDetailPage() {
  return (
    <Suspense>
      <OrderDetail />
    </Suspense>
  );
}
