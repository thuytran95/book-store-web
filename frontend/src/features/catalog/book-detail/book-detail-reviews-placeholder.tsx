import { MaterialIcon } from "@/features/home/components/material-icon";
import { PDP_STATIC } from "./pdp-static-copy";
import { pdpSurface } from "./pdp-styles";

function Stars({ size = "md" }: { size?: "md" | "lg" }) {
  const cls = size === "lg" ? "text-[22px]" : "text-[18px]";
  return (
    <div className="flex text-amber-600" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialIcon key={i} name="star" className={cls} />
      ))}
    </div>
  );
}

export function BookDetailReviewsPlaceholder() {
  const section = PDP_STATIC.reviewsSection;

  return (
    <section className={pdpSurface() + " space-y-6 p-6"} aria-labelledby="pdp-reviews-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="pdp-reviews-heading" className="text-headline-lg-mobile md:text-headline-lg font-bold">
            {section.title}
          </h2>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        </div>
        <button
          type="button"
          disabled
          title="Sắp ra mắt"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-semibold opacity-60"
        >
          <MaterialIcon name="rate_review" className="text-lg" />
          Viết đánh giá ấn phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 rounded-xl bg-muted/50 p-6 md:grid-cols-12">
        <div className="flex flex-col items-center text-center md:col-span-4">
          <span className="text-5xl font-bold">{section.average}</span>
          <Stars size="lg" />
          <p className="mt-1 text-sm text-muted-foreground">{section.satisfaction}</p>
        </div>
        <div className="space-y-2 md:col-span-8">
          {section.bars.map((bar) => (
            <div
              key={bar.stars}
              className={cnRow(bar.percent)}
            >
              <span className="w-12 text-right text-sm font-semibold">{bar.stars} sao</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
              <span className="w-8 text-sm text-muted-foreground">{bar.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {section.filterChips.map((chip, i) => (
          <span
            key={chip}
            className={
              i === 0
                ? "rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary"
                : "rounded-full bg-muted px-4 py-1.5 text-xs text-foreground"
            }
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {section.reviews.map((r) => (
          <article key={r.title} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{r.author}</p>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>
            <Stars />
            <h3 className="mt-2 font-semibold">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function cnRow(percent: number) {
  return `flex items-center gap-3 text-sm ${percent === 0 ? "opacity-50" : ""}`;
}
