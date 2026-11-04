import type { Metadata } from "next";
import { Suspense } from "react";
import { BookList } from "@/features/catalog/components/book-list";
import { getBooks } from "@/features/catalog/server";
import { parseBookQuery } from "@/lib/book-query";

export const metadata: Metadata = {
  title: "Danh sách sách cũ",
  description: "Duyệt và lọc sách cũ theo danh mục, giá và tình trạng.",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseBookQuery(await searchParams);
  const data = await getBooks(query).catch(() => undefined);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Sách</h1>
      <Suspense fallback={null}>
        <BookList initial={data ? { query, data } : undefined} />
      </Suspense>
    </div>
  );
}
