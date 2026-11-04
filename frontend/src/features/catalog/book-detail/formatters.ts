import type { components } from "@/lib/api/schema";

type BookDetail = components["schemas"]["BookDetail"];

/** NXB line for hero meta, e.g. "Mai Lĩnh (1957)". */
export function formatPublisherYear(
  publisher?: string | null,
  publishedYear?: number | null,
): string | null {
  if (!publisher && !publishedYear) return null;
  if (publisher && publishedYear) return `${publisher} (${publishedYear})`;
  return publisher ?? String(publishedYear);
}

export type SpecRow = { label: string; value: string };

/** Map API fields to appraisal spec table rows (omit empty values). */
export function bookDetailSpecRows(
  book: Pick<BookDetail, "title" | "author" | "publisher" | "published_year" | "condition_pct">,
): SpecRow[] {
  const rows: SpecRow[] = [
    { label: "Tên tác phẩm", value: book.title },
  ];
  if (book.author) rows.push({ label: "Tác giả", value: book.author });
  if (book.publisher) rows.push({ label: "Nhà xuất bản", value: book.publisher });
  if (book.published_year) {
    rows.push({ label: "Năm ấn hành", value: String(book.published_year) });
  }
  rows.push({
    label: "Tình trạng",
    value: `Nguyên bản ${book.condition_pct}%`,
  });
  return rows;
}
