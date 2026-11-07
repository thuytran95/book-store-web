"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConditionBadge, PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import type { BookCardData } from "@/features/catalog/components/book-card";
import { useAddToCart } from "@/features/cart/hooks";
import { formatVnd } from "@/lib/format";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

export function HomeBookCard({ book }: { book: BookCardData }) {
  const router = useRouter();
  const { session } = useSession();
  const add = useAddToCart();
  const soldOut = book.available <= 0;

  const metaLine = [book.author, book.category?.name].filter(Boolean).join(" • ");

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div>
        <Link
          href={`/books/${book.slug}`}
          className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 p-3"
        >
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={book.title}
              loading="lazy"
              className={cn(
                "h-44 object-contain shadow-book transition-transform group-hover:scale-105",
                soldOut && "opacity-50 grayscale",
              )}
            />
          ) : (
            <BookOpen className="size-12 text-muted-foreground" aria-hidden />
          )}
        </Link>
        <div className="pt-4 text-center">
          {metaLine && <p className="text-xs font-medium text-gray-500">{metaLine}</p>}
          <Link href={`/books/${book.slug}`}>
            <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">
              {book.title}
            </h3>
          </Link>
          <div className="mt-2 flex justify-center">
            <ConditionBadge pct={book.condition_pct} />
          </div>
        </div>
      </div>
      <div className="mt-2 border-t border-gray-100 pt-4">
        <div className="mb-2.5 flex items-baseline justify-center gap-2">
          <PriceTag amount={book.price} size="sm" className="text-base font-extrabold" />
        </div>
        <Button
          type="button"
          disabled={soldOut || add.isPending}
          className="w-full rounded-lg py-2 text-xs font-semibold"
          onClick={() => {
            if (!session) {
              router.push(`/login?next=${encodeURIComponent("/")}`);
              return;
            }
            add.mutate({ bookId: book.id });
          }}
        >
          <MaterialIcon name="shopping_cart" className="text-sm" />
          {soldOut ? "Hết hàng" : "Thêm vào giỏ"}
        </Button>
        {!soldOut && (
          <p className="sr-only">Giá {formatVnd(book.price)}</p>
        )}
      </div>
    </div>
  );
}

export function HomeBookCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 p-4">
      <div className="h-56 rounded-lg bg-muted" />
      <div className="mt-4 grid gap-2">
        <div className="mx-auto h-3 w-2/3 rounded bg-muted" />
        <div className="mx-auto h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
