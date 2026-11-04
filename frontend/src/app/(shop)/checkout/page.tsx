import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/features/cart/components/checkout-view";

export const metadata: Metadata = { title: "Thanh toán" };

export default function CheckoutPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Thanh toán</h1>
      <Suspense fallback={null}>
        <CheckoutView />
      </Suspense>
    </div>
  );
}
