"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/features/cart/hooks";
import { useSession } from "@/lib/session";

type Props = { bookId: number; available: number; visible: boolean };

/** Add to cart. Guests are sent to `/login?next=`. */
export function BookActions({ bookId, available, visible }: Props) {
  const router = useRouter();
  const { session } = useSession();
  const add = useAddToCart();
  const soldOut = available <= 0 || !visible;

  if (soldOut) {
    return <p className="text-sm font-medium text-destructive">Sách này đã hết hàng.</p>;
  }

  const requireLogin = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="lg"
        disabled={add.isPending}
        onClick={() => (session ? add.mutate({ bookId }) : requireLogin())}
      >
        <ShoppingCart /> Thêm vào giỏ
      </Button>
    </div>
  );
}
