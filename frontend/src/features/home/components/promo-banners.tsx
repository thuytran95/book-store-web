import Link from "next/link";
import type { PromoBanner } from "@/config/home";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

export function PromoBanners({ banners }: { banners: PromoBanner[] }) {
  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto max-w-page px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {banners.map((banner) => (
            <div
              key={banner.title}
              className={cn(
                "relative flex items-center justify-between overflow-hidden rounded-2xl p-7 shadow-lg sm:p-9",
                banner.variant === "orange" &&
                  "bg-gradient-to-r from-orange-600 to-orange-500 text-white",
                banner.variant === "amber" &&
                  "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900",
              )}
            >
              <div className="z-10 max-w-[60%] space-y-2">
                <span
                  className={cn(
                    "inline-block rounded px-2.5 py-0.5 text-xs font-black tracking-wider uppercase",
                    banner.variant === "orange" && "bg-white/20 backdrop-blur-sm",
                    banner.variant === "amber" && "bg-black/10 text-amber-950",
                  )}
                >
                  {banner.eyebrow}
                </span>
                <h3 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
                  {banner.title}
                </h3>
                <p
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    banner.variant === "orange" && "text-orange-100",
                    banner.variant === "amber" && "text-amber-950",
                  )}
                >
                  {banner.body}
                </p>
                <div className="pt-2">
                  <Link
                    href={banner.cta.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold shadow-md transition-all",
                      banner.variant === "orange" && "bg-white text-orange-600 hover:bg-orange-50",
                      banner.variant === "amber" && "bg-gray-950 text-amber-300 hover:bg-black",
                    )}
                  >
                    {banner.cta.label}
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </Link>
                </div>
              </div>
              <div className="perspective-book flex w-36 shrink-0 justify-end sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.coverImageUrl}
                  alt={banner.coverAlt}
                  className={cn(
                    "book-3d h-40 w-28 rounded-r-md object-cover shadow-2xl sm:h-44 sm:w-32",
                    banner.variant === "orange" && "rotate-12",
                    banner.variant === "amber" && "-rotate-6",
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
