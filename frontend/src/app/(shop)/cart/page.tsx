import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";

export const metadata: Metadata = { title: "Giỏ hàng" };

export default function CartPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>
      <CartView />
    </div>
  );
}
