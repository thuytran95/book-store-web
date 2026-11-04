import Link from "next/link";
import { homeContent, type FeaturedAuthor } from "@/config/home";
import { MaterialIcon } from "./material-icon";

export function FeaturedAuthors({
  authors,
  viewAllHref = "/books",
}: {
  authors: FeaturedAuthor[];
  viewAllHref?: string;
}) {
  const { authorsSection } = homeContent;

  return (
    <section
      className="w-full border-t border-b border-gray-100 bg-[#fbfcfb] py-12"
      id="tac-gia"
    >
      <div className="mx-auto max-w-page px-4">
        <div className="flex items-center justify-between pb-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              {authorsSection.eyebrow}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 lg:text-3xl">
              {authorsSection.title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-xs font-bold text-accent-warm hover:text-orange-700"
          >
            {authorsSection.viewAllLabel}
            <MaterialIcon name="chevron_right" className="text-base" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {authors.map((author) => (
            <Link
              key={author.name}
              href={`/books?text=${encodeURIComponent(author.searchQuery)}`}
              className="group rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
            >
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 p-1 transition-colors group-hover:border-primary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.portraitUrl}
                  alt={author.name}
                  className="h-full w-full rounded-full object-cover sepia-[0.3]"
                />
              </div>
              <h4 className="mt-3 text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">
                {author.name}
              </h4>
              <p className="mt-0.5 text-xs font-medium text-gray-500">{author.tagline}</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                {author.bookCountLabel}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
