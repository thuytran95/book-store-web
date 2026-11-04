"use client";

import Link from "next/link";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { ConditionBadge } from "@/components/shared/badges";
import { cn } from "@/lib/utils";
import { formatPublisherYear } from "./formatters";
import { PDP_STATIC } from "./pdp-static-copy";
import { pdpSurface } from "./pdp-styles";

function StaticStars({ className }: { className?: string }) {
  return (
    <div className={cn("flex text-amber-600", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialIcon key={i} name="star" className="text-[18px]" />
      ))}
    </div>
  );
}

export function BookDetailHeroInfo({
  title,
  author,
  publisher,
  publishedYear,
  categoryName,
  conditionPct,
  available,
}: {
  title: string;
  author?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  categoryName: string;
  conditionPct: number;
  available: number;
}) {
  const soldOut = available <= 0;
  const publisherLine = formatPublisherYear(publisher, publishedYear);

  return (
    <div className={cn(pdpSurface(), "space-y-3 p-5")}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {author && (
          <>
            <span>
              Tác giả:{" "}
              <Link
                href={`/books?text=${encodeURIComponent(author)}`}
                className="font-semibold text-primary hover:underline"
              >
                {author}
              </Link>
            </span>
            <span className="text-border">•</span>
          </>
        )}
        {publisherLine && (
          <>
            <span>
              NXB: <strong className="text-foreground">{publisherLine}</strong>
            </span>
            <span className="text-border">•</span>
          </>
        )}
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-primary">
          {categoryName}
        </span>
      </div>
      <h1 className="text-headline-lg-mobile md:text-headline-lg text-balance text-foreground leading-snug">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
        <div
          className="flex items-center gap-1.5"
          aria-label="Đánh giá mẫu, chưa có dữ liệu thật"
        >
          <span className="text-headline-sm font-bold">{PDP_STATIC.reviewSummary.average}</span>
          <StaticStars />
          <span className="text-muted-foreground underline decoration-dotted">
            {PDP_STATIC.reviewSummary.countLabel}
          </span>
        </div>
        {!soldOut && (
          <>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1 font-semibold text-secondary">
              <MaterialIcon name="eco" className="text-base" />
              Tình trạng: Nguyên bản {conditionPct}%
            </span>
          </>
        )}
        {soldOut && (
          <ConditionBadge pct={conditionPct} className="opacity-70" />
        )}
      </div>
    </div>
  );
}
