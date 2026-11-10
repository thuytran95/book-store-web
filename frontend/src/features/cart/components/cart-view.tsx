"use client";

import { PriceTag } from "@/components/shared/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/session";
import { useCart } from "../hooks/use-cart";
import { CartLine } from "./cart-line";
import { LinkButton } from "@/components/shared/link-button";

export function CartView() {
  const { session, isLoading: sessionLoading } = useSession();
  const { items, total, count, setQty, remove, isLoading, isMutating } =
    useCart();

  if (sessionLoading || isLoading) return <Skeleton className="h-64" />;
  if (!session) {
    return (
      <EmptyState
        title="Đăng nhập để xem giỏ hàng"
        action={<LinkButton href="/login?next=/cart">Đăng nhập</LinkButton>}
      />
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy chọn vài cuốn sách bạn thích."
        action={<LinkButton href="/books">Xem sách</LinkButton>}
      />
    );
  }

  const blocked = items.some(
    (i) => !i.book.is_visible || i.available <= 0 || i.quantity > i.available,
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
      <ul className="divide-y rounded-xl border px-4">
        {items.map((item) => (
          <CartLine
            key={item.book.id}
            item={item}
            disabled={isMutating}
            onQtyChange={(q) => setQty(item.book.id, q)}
            onRemove={() => remove(item.book.id)}
          />
        ))}
      </ul>

      <aside className="sticky bottom-16 h-fit rounded-xl border bg-background p-4 md:top-24 md:bottom-auto">
        <h2 className="mb-2 font-semibold">Tóm tắt</h2>
        <div className="flex justify-between text-sm">
          <span>{count} cuốn</span>
          <PriceTag amount={total} size="lg" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground mb-4">
          Phí vận chuyển được xác nhận khi chốt đơn.
        </p>
        <LinkButton href="/checkout">Thanh toán</LinkButton>
        {blocked && (
          <p role="alert" className="mt-2 text-xs text-destructive">
            Vui lòng xử lý các sách không còn đủ hàng trước khi thanh toán.
          </p>
        )}
      </aside>
    </div>
  );
}
