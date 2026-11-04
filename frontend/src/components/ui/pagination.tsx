"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { page: number; pageCount: number; onChange: (page: number) => void };

function windowed(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {windowed(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            aria-label={`Trang ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="icon"
        aria-label="Trang sau"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
