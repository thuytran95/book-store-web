import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutProgress } from "@/features/cart/components/checkout-steps";
import { CheckoutView } from "@/features/cart/components/checkout-view";

export const metadata: Metadata = { title: "Thanh toán" };

export default function CheckoutPage() {
  return (
    <div className="grid gap-8 pb-12 md:gap-10">
      <header className="grid gap-4">
        <CheckoutProgress />
        <h1 className="text-headline-xl-mobile text-primary md:text-headline-xl">Thanh toán</h1>
      </header>
      <Suspense fallback={null}>
        <CheckoutView />
      </Suspense>
    </div>
  );
}
