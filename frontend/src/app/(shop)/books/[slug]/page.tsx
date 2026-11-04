import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailBreadcrumb } from "@/features/catalog/book-detail/book-detail-breadcrumb";
import { BookDetailBuyBox } from "@/features/catalog/book-detail/book-detail-buy-box";
import { BookDetailEditorial } from "@/features/catalog/book-detail/book-detail-editorial";
import { BookDetailGallery } from "@/features/catalog/book-detail/book-detail-gallery";
import { BookDetailHeroInfo } from "@/features/catalog/book-detail/book-detail-hero-info";
import { BookDetailHighlights } from "@/features/catalog/book-detail/book-detail-highlights";
import { BookDetailPricingPromo } from "@/features/catalog/book-detail/book-detail-pricing-promo";
import { BookDetailRelated } from "@/features/catalog/book-detail/book-detail-related";
import { BookDetailReviewsPlaceholder } from "@/features/catalog/book-detail/book-detail-reviews-placeholder";
import { BookDetailSidebar } from "@/features/catalog/book-detail/book-detail-sidebar";
import { BookDetailSpecTable } from "@/features/catalog/book-detail/book-detail-spec-table";
import { BookDetailTrustGrid } from "@/features/catalog/book-detail/book-detail-trust-grid";
import { bookDetailSpecRows } from "@/features/catalog/book-detail/formatters";
import { getBook, getRelatedBooks } from "@/features/catalog/server";

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
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book || !book.is_visible) notFound();

  const related = await getRelatedBooks(book.id, book.category.slug);
  const specRows = bookDetailSpecRows(book);
  const galleryBadge =
    book.published_year != null ? `Ấn bản ${book.published_year}` : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <BookDetailBreadcrumb
        items={[
          { label: "Sách", href: "/books" },
          { label: book.category.name, href: `/books?category=${book.category.slug}` },
          { label: book.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-4 lg:col-span-4">
          <BookDetailGallery
            images={book.images}
            title={book.title}
            fallbackCover={book.cover_url}
            badgeText={galleryBadge}
          />
          <BookDetailHighlights />
        </div>

        <div className="space-y-4 lg:col-span-5">
          <BookDetailHeroInfo
            title={book.title}
            author={book.author}
            publisher={book.publisher}
            publishedYear={book.published_year}
            categoryName={book.category.name}
            conditionPct={book.condition_pct}
            available={book.available}
          />
          <BookDetailPricingPromo salePrice={book.sale_price} />
          <BookDetailTrustGrid />
        </div>

        <div className="lg:col-span-3">
          <BookDetailBuyBox
            bookId={book.id}
            title={book.title}
            salePrice={book.sale_price}
            available={book.available}
            visible={book.is_visible}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-12 lg:gap-8">
        <div id="mo-ta" className="space-y-6 lg:col-span-8">
          <BookDetailSpecTable rows={specRows} />
          {book.description ? (
            <BookDetailEditorial description={book.description} conditionPct={book.condition_pct} />
          ) : null}
        </div>
        <div className="lg:col-span-4">
          <BookDetailSidebar author={book.author} />
        </div>
      </div>

      <div className="space-y-8 px-4">
        <BookDetailRelated books={related} />
        <BookDetailReviewsPlaceholder />
      </div>
    </div>
  );
}
