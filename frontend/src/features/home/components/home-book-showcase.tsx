"use client";

import Link from "next/link";
import type { HomeBookTabId } from "@/config/catalog-home";
import { homeContent } from "@/config/home";
import type { components } from "@/lib/api/schema";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useHomeBookTabs } from "../hooks/use-home-book-tabs";
import { HomeBookCard, HomeBookCardSkeleton } from "./home-book-card";
import { MaterialIcon } from "./material-icon";

type BookPage = components["schemas"]["Page_BookCard_"];

type Props = {
  initialBooks: BookPage;
  initialTabId?: HomeBookTabId;
};

export function HomeBookShowcase({ initialBooks, initialTabId = "featured" }: Props) {
  const { tabs, activeTabId, setActiveTabId, books, total, isFetching } = useHomeBookTabs(
    initialTabId,
    initialBooks,
  );
  const { showcase } = homeContent;

  return (
    <section className="w-full bg-white py-12" id="kho-sach">
      <div className="mx-auto max-w-page px-4">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-bold tracking-wider text-accent-warm uppercase">
              {showcase.eyebrow}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 lg:text-3xl">{showcase.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-gray-100 p-1.5 text-xs font-bold">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 transition-all",
                  activeTabId === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-1 gap-6 pt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isFetching && books.length === 0
            ? Array.from({ length: 8 }, (_, i) => <HomeBookCardSkeleton key={i} />)
            : null}
          {!isFetching && books.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="Chưa có sách trong mục này"
                description="Thử tab khác hoặc xem toàn bộ kho sách."
                action={
                  <Link
                    href="/books"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Xem kho sách
                  </Link>
                }
              />
            </div>
          ) : (
            books.map((book) => <HomeBookCard key={book.id} book={book} />)
          )}
          {isFetching && books.length > 0 && (
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/40" aria-hidden />
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/books?sort=newest"
            className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-8 py-3 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-gray-50"
          >
            {showcase.viewAllLabel}
            {total > 0 ? ` (${total} cuốn)` : ""}
            <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
}
