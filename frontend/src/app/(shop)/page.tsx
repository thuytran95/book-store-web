import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/features/catalog/components/book-card";
import { getHomeData } from "@/features/catalog/server";

export const metadata: Metadata = {
  title: "Hiệu sách cũ – sách đã qua sử dụng giá tốt",
  description: "Mua sách cũ chất lượng, mỗi cuốn một bản duy nhất. Tìm theo tên, tác giả, danh mục.",
};

export const revalidate = 60;

export default async function HomePage() {
  const { categories, newest } = await getHomeData();
  const almostGone = newest.items.filter((b) => b.available === 1).slice(0, 6);

  return (
    <div className="grid gap-10">
      <section className="rounded-2xl bg-primary/5 p-6 sm:p-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Sách cũ chọn lọc, mỗi cuốn một bản duy nhất</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Tìm cuốn sách bạn cần trước khi người khác lấy mất.
        </p>
        <form action="/books" role="search" className="mt-4 flex max-w-xl gap-2">
          <input
            name="text"
            aria-label="Tìm sách"
            placeholder="Tìm theo tên sách, tác giả…"
            className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            Tìm
          </button>
        </form>
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="home-categories">
          <h2 id="home-categories" className="mb-3 text-lg font-semibold">
            Danh mục
          </h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/books?category=${c.slug}`}
                  className="inline-block rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="home-newest">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="home-newest" className="text-lg font-semibold">
            Sách mới về
          </h2>
          <Link href="/books?sort=newest" className="text-sm text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        {newest.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có sách nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {newest.items.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      {almostGone.length > 0 && (
        <section aria-labelledby="home-almost">
          <h2 id="home-almost" className="mb-3 text-lg font-semibold">
            Sắp hết – chỉ còn 1 cuốn
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {almostGone.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
