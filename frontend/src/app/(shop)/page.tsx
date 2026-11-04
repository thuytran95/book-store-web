import type { Metadata } from "next";
import { homeContent } from "@/config/home";
import { getHomeData } from "@/features/catalog/server";
import { FeaturedAuthors } from "@/features/home/components/featured-authors";
import { HomeBookShowcase } from "@/features/home/components/home-book-showcase";
import { HomeHero } from "@/features/home/components/home-hero";
import { NewsletterForm } from "@/features/home/components/newsletter-form";
import { PromoBanners } from "@/features/home/components/promo-banners";
import { StoreExperience } from "@/features/home/components/store-experience";
import { TrustPillars } from "@/features/home/components/trust-pillars";

const slide = homeContent.heroSlides[0];

export const metadata: Metadata = {
  title: "Sách Xưa & Nay - Hiệu Sách Di Sản & Sưu Tầm",
  description: slide.description,
};

export const revalidate = 60;

export default async function HomePage() {
  const { defaultTabBooks, heroBooks } = await getHomeData();

  return (
    <div className="w-full">
      <HomeHero
        slides={[...homeContent.heroSlides]}
        fallbackBooks={heroBooks.items}
      />
      <TrustPillars items={[...homeContent.trustPillars]} />
      <HomeBookShowcase initialBooks={defaultTabBooks} />
      <PromoBanners banners={[...homeContent.promoBanners]} />
      <FeaturedAuthors authors={[...homeContent.featuredAuthors]} />
      <StoreExperience content={homeContent.storeSection} />
      <NewsletterForm />
    </div>
  );
}
