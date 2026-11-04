"use client";

import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/schema";

export type CartItem = components["schemas"]["CartItemRead"];

type Props = {
  item: CartItem;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function CartLine({ item, onQtyChange, onRemove, disabled }: Props) {
  const { book, quantity, available } = item;
  const unavailable = !book.is_visible || available <= 0;
  const exceeds = !unavailable && quantity > available;
  const max = Math.max(available, 0);

  return (
    <li className="flex gap-3 py-4">
      <Link href={`/books/${book.slug}`} className="h-24 w-18 shrink-0 overflow-hidden rounded-md bg-muted">
        {book.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_url} alt={book.title} loading="lazy" className="size-full object-cover" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={`/books/${book.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
          {book.title}
        </Link>
        <PriceTag amount={book.sale_price} size="sm" />

        {(unavailable || exceeds) && (
          <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="size-3.5" />
            {unavailable
              ? "Sách này hiện không còn bán. Vui lòng xoá khỏi giỏ."
              : `Chỉ còn ${available} cuốn. Hãy giảm số lượng.`}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1" role="group" aria-label="Số lượng">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Giảm số lượng"
              disabled={disabled || quantity <= 1}
              onClick={() => onQtyChange(quantity - 1)}
            >
              <Minus />
            </Button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Tăng số lượng"
              disabled={disabled || unavailable || quantity >= max}
              onClick={() => onQtyChange(quantity + 1)}
            >
              <Plus />
            </Button>
          </div>
          <PriceTag amount={item.line_total} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Xoá ${book.title} khỏi giỏ`}
            onClick={onRemove}
            disabled={disabled}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  );
}
