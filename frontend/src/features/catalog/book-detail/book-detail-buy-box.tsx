"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { useAddToCart } from "@/features/cart/hooks";
import { formatVnd } from "@/lib/format";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { pdpPillButtonPrimary, pdpPillButtonSecondary, pdpSurface } from "./pdp-styles";

export function BookDetailBuyBox({
  bookId,
  salePrice,
  available,
  visible,
}: {
  bookId: number;
  salePrice: number;
  available: number;
  visible: boolean;
}) {
  const router = useRouter();
  const { session } = useSession();
  const add = useAddToCart();
  const soldOut = available <= 0 || !visible;
  const maxQty = Math.max(available, 1);
  const [qty, setQty] = useState(1);
  const lockedQty = available === 1;
  const effectiveQty = lockedQty ? 1 : Math.min(qty, available);
  const subtotal = salePrice * effectiveQty;

  const requireLogin = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  if (soldOut) {
    return (
      <aside className={cn(pdpSurface(), "space-y-3 p-5 lg:sticky lg:top-44")}>
        <p className="text-sm font-medium text-destructive">Sách này đã hết hàng.</p>
      </aside>
    );
  }

  const addWithQty = (thenGoCart?: boolean) => {
    if (!session) return requireLogin();
    add.mutate(
      { bookId, quantity: effectiveQty },
      {
        onSuccess: () => {
          if (thenGoCart) router.push("/cart");
        },
      },
    );
  };

  return (
    <aside className={cn(pdpSurface(), "space-y-4 p-5 lg:sticky lg:top-44")}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Số lượng</span>
        <div className="inline-flex items-center rounded-full border bg-background">
          <button
            type="button"
            className="rounded-l-full p-2 disabled:opacity-40"
            disabled={lockedQty || effectiveQty <= 1}
            aria-label="Giảm số lượng"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center font-semibold tabular-nums">{effectiveQty}</span>
          <button
            type="button"
            className="rounded-r-full p-2 disabled:opacity-40"
            disabled={lockedQty || effectiveQty >= maxQty}
            aria-label="Tăng số lượng"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex items-baseline justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Tạm tính</span>
        <span className="text-lg font-bold text-primary tabular-nums">{formatVnd(subtotal)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {available > 0 ? (
          <>Còn <strong>{available}</strong> cuốn</>
        ) : (
          "Hết hàng"
        )}
      </p>
      <div className="grid gap-2">
        <button
          type="button"
          className={cn(pdpPillButtonPrimary, "w-full")}
          disabled={add.isPending}
          onClick={() => addWithQty(true)}
        >
          MUA NGAY
        </button>
        <button
          type="button"
          className={cn(pdpPillButtonSecondary, "w-full border")}
          disabled={add.isPending}
          onClick={() => addWithQty(false)}
        >
          <ShoppingCart className="size-4" />
          THÊM VÀO GIỎ HÀNG
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MaterialIcon name="payments" className="text-base" />
          Thanh toán an toàn
        </span>
        <span className="inline-flex items-center gap-1">
          <MaterialIcon name="local_shipping" className="text-base" />
          Giao toàn quốc
        </span>
      </div>
    </aside>
  );
}
