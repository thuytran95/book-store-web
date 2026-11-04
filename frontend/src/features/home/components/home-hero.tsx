"use client";

import Link from "next/link";
import { useState } from "react";
import type { HeroBookCover, HeroSlide } from "@/config/home";
import type { BookCardData } from "@/features/catalog/components/book-card";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

type Props = {
  slides: HeroSlide[];
  fallbackBooks?: BookCardData[];
};

export function HomeHero({ slides, fallbackBooks }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];
  const books: HeroBookCover[] =
    slide.books.length > 0
      ? slide.books
      : (fallbackBooks ?? []).slice(0, 3).map((b) => ({
          imageUrl: b.cover_url ?? "",
          alt: b.title,
        }));

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section className="relative w-full overflow-hidden border-b border-orange-100/70 bg-[#fcf8f5] py-8 lg:py-12">
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-orange-100/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-emerald-100/40 blur-2xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-page px-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold tracking-wide text-orange-800 uppercase">
              <MaterialIcon name="workspace_premium" className="text-sm" />
              {slide.eyebrow}
            </span>
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {slide.titleBefore}
              <span className="font-black text-primary">
                {slide.titleHighlight}
              </span>
              {slide.titleAfter}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-600">
              {slide.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={slide.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
              >
                {slide.primaryCta.label}
                <MaterialIcon name="arrow_forward" className="text-base" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex rounded-full border border-black bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-gray-50"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>
            {slide.priceTeaser && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2" aria-hidden>
                  {["30s", "50s", "70s"].map((label, i) => (
                    <span
                      key={label}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold",
                        i === 0 && "bg-amber-200 text-amber-900",
                        i === 1 && "bg-emerald-200 text-emerald-900",
                        i === 2 && "bg-rose-200 text-rose-900",
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-600">
                  {slide.priceTeaser.label}{" "}
                  <span className="text-sm font-bold text-accent-warm">
                    {slide.priceTeaser.priceLabel}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center lg:col-span-6">
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Trước"
                  onClick={prev}
                  className="absolute -left-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white shadow-lg transition-all hover:bg-black lg:left-0"
                >
                  <MaterialIcon name="chevron_left" className="text-lg" />
                </button>
                <button
                  type="button"
                  aria-label="Tiếp theo"
                  onClick={next}
                  className="absolute -right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white shadow-lg transition-all hover:bg-black lg:right-0"
                >
                  <MaterialIcon name="chevron_right" className="text-lg" />
                </button>
              </>
            )}
            <div className="perspective-book relative flex h-72 w-full max-w-lg items-center justify-center sm:h-80">
              {books[0] && (
                <div className="book-3d absolute left-4 z-10 w-44 rounded-l-sm rounded-r-md border-l-4 border-amber-900 bg-white p-2 shadow-book sm:left-8 sm:w-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={books[0].imageUrl}
                    alt={books[0].alt}
                    className="h-56 w-full rounded object-cover shadow-inner sm:h-64"
                  />
                  {books[0].badge && (
                    <span className="absolute top-3 left-3 rounded bg-amber-700 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      {books[0].badge}
                    </span>
                  )}
                </div>
              )}
              {books[1] && (
                <div className="book-3d absolute z-20 w-48 scale-105 rounded-l-sm rounded-r-md border-l-4 border-emerald-950 bg-white p-2 shadow-book sm:w-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={books[1].imageUrl}
                    alt={books[1].alt}
                    className="h-60 w-full rounded object-cover shadow-inner sm:h-68"
                  />
                  {books[1].badge && (
                    <span className="absolute top-3 right-3 rounded bg-accent-warm px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      {books[1].badge}
                    </span>
                  )}
                </div>
              )}
              {books[2] && (
                <div className="book-3d absolute right-4 z-10 w-44 rounded-l-sm rounded-r-md border-l-4 border-sky-900 bg-white p-2 shadow-book sm:right-8 sm:w-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={books[2].imageUrl}
                    alt={books[2].alt}
                    className="h-56 w-full rounded object-cover shadow-inner sm:h-64"
                  />
                  {books[2].badge && (
                    <span className="absolute top-3 right-3 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      {books[2].badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
