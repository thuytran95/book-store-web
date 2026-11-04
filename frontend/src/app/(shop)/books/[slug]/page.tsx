import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConditionBadge, PriceTag } from "@/components/shared/badges";
import { BookActions } from "@/features/catalog/components/book-actions";
import { BookGallery } from "@/features/catalog/components/book-gallery";
import { getBook } from "@/features/catalog/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook((await params).slug).catch(() => null);
  if (!book) return { title: "Không tìm thấy sách" };
  return {
    title: book.title,
    description: book.description?.slice(0, 160) ?? `${book.title}${book.author ? ` – ${book.author}` : ""}`,
    openGraph: book.cover_url ? { images: [book.cover_url] } : undefined,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const book = await getBook((await params).slug);
  if (!book || !book.is_visible) notFound();

  return (
    <article className="grid gap-6 md:grid-cols-2 md:gap-10">
      <BookGallery images={book.images} title={book.title} fallback={book.cover_url} />
      <div className="grid content-start gap-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/books" className="hover:underline">Sách</Link>
          {" / "}
          <Link href={`/books?category=${book.category.slug}`} className="hover:underline">
            {book.category.name}
          </Link>
        </nav>
        <h1 className="text-2xl font-bold">{book.title}</h1>
        {book.author && <p className="text-muted-foreground">{book.author}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <PriceTag amount={book.sale_price} size="lg" />
          <ConditionBadge pct={book.condition_pct} />
        </div>
        <p className="text-sm">
          {book.available > 0 ? (
            <>Còn <strong>{book.available}</strong> cuốn</>
          ) : (
            <span className="text-destructive">Hết hàng</span>
          )}
        </p>
        <BookActions
          bookId={book.id}
          title={book.title}
          available={book.available}
          visible={book.is_visible}
        />
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {book.publisher && (<><dt className="text-muted-foreground">Nhà xuất bản</dt><dd>{book.publisher}</dd></>)}
          {book.published_year && (<><dt className="text-muted-foreground">Năm xuất bản</dt><dd>{book.published_year}</dd></>)}
        </dl>
        {book.description && (
          <section aria-labelledby="desc">
            <h2 id="desc" className="mb-1 font-semibold">Mô tả</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">{book.description}</p>
          </section>
        )}
      </div>
    </article>
  );
}
