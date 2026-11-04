"use client";

import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import type { BookPage } from "../hooks/use-catalog";
import { useBookQuery, useCategories } from "../hooks/use-catalog";
import type { BookQuery } from "@/lib/book-query";
import { BookCard, BookCardSkeleton } from "./book-card";
import { BookFilters } from "./book-filters";

export function BookList({ initial }: { initial?: { query: BookQuery; data: BookPage } }) {
  const { data: categories = [] } = useCategories();
  const { data, isLoading, isFetching, error, filters, setFilters, setPage, textInput, setTextInput, reset } =
    useBookQuery("/books", initial);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="grid gap-4 md:grid-cols-[15rem_1fr] md:gap-8">
      <div className="grid content-start gap-3">
        <Input
          type="search"
          aria-label="Tìm sách"
          placeholder="Tìm theo tên sách, tác giả…"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <BookFilters categories={categories} value={filters} onChange={setFilters} onClear={reset} />
      </div>

      <section aria-busy={isFetching} className="grid content-start gap-4">
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total} cuốn sách
          </p>
        )}
        {error ? (
          <div className="grid justify-items-start gap-2">
            <ErrorMessage error={error} />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sách phù hợp"
            description="Thử bỏ bớt bộ lọc, hoặc gửi yêu cầu để chúng tôi tìm giúp bạn."
            action={
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                  Xoá bộ lọc
                </Button>
                <Button render={<a href={`/book-requests?title=${encodeURIComponent(filters.text ?? "")}`} />}>
                  Yêu cầu tìm sách
                </Button>
              </div>
            }
          />
        ) : (
          <div className={`grid grid-cols-2 gap-3 lg:grid-cols-3 ${isFetching ? "opacity-70" : ""}`}>
            {data?.items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
        <Pagination page={filters.page} pageCount={pageCount} onChange={setPage} />
      </section>
    </div>
  );
}
