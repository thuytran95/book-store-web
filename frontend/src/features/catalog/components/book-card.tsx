import { BookOpen } from "lucide-react";
import Link from "next/link";
import { ConditionBadge, PriceTag } from "@/components/shared/badges";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

export type BookCardData = components["schemas"]["BookCard"];

const ALMOST_GONE_AT = 1;

export function BookCard({ book, className }: { book: BookCardData; className?: string }) {
  const soldOut = book.available <= 0;
  const almostGone = !soldOut && book.available <= ALMOST_GONE_AT;

  return (
    <Link
      href={`/books/${book.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="relative aspect-[3/4] bg-muted">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            loading="lazy"
            className={cn("size-full object-cover", soldOut && "opacity-50 grayscale")}
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <BookOpen className="size-10" aria-hidden />
            <span className="sr-only">Chưa có ảnh bìa</span>
          </div>
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold text-white">
            Hết hàng
          </span>
        )}
        {almostGone && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
            Sắp hết
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium group-hover:underline">{book.title}</h3>
        {book.author && <p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <PriceTag amount={book.sale_price} size="sm" />
          <ConditionBadge pct={book.condition_pct} />
        </div>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border">
      <div className="aspect-[3/4] bg-muted" />
      <div className="grid gap-2 p-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
