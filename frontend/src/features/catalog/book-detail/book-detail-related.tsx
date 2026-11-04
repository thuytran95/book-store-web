"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { BookCard, type BookCardData } from "@/features/catalog/components/book-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookDetailRelated({
  books,
  title = "Sách cùng thể loại",
  subtitle = "Ấn bản tương tự đang có sẵn",
}: {
  books: BookCardData[];
  title?: string;
  subtitle?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (books.length === 0) return null;

  const scrollBy = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="space-y-4" aria-labelledby="related-books-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="related-books-heading" className="text-headline-md font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-1 md:hidden">
          <Button type="button" size="icon-sm" variant="outline" aria-label="Cuộn trái" onClick={() => scrollBy(-1)}>
            <ChevronLeft />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" aria-label="Cuộn phải" onClick={() => scrollBy(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className={cn(
          "flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible",
          "snap-x snap-mandatory md:snap-none",
        )}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} className="min-w-[220px] shrink-0 snap-start md:min-w-0" />
        ))}
      </div>
    </section>
  );
}
