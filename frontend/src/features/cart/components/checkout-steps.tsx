import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FLOW = [
  { label: "Giỏ hàng", href: "/cart" },
  { label: "Thanh toán" },
  { label: "Hoàn tất" },
] as const;

/** Cart → checkout → done. Checkout is always the current step. */
export function CheckoutProgress({ className }: { className?: string }) {
  const current = 1;
  return (
    <nav aria-label="Tiến trình đặt hàng" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {FLOW.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const dot = (
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                done && "bg-secondary-container text-primary",
                active && "bg-primary text-primary-foreground",
                !done && !active && "border border-outline-variant text-outline",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
          );
          return (
            <li key={step.label} className="flex items-center gap-2">
              {done && "href" in step ? (
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-2 rounded-full pr-1 text-on-surface-variant hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {dot}
                  {step.label}
                </Link>
              ) : (
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2",
                    active ? "font-semibold text-primary" : "text-outline",
                  )}
                >
                  {dot}
                  {step.label}
                </span>
              )}
              {i < FLOW.length - 1 && (
                <span aria-hidden className="h-px w-6 bg-outline-variant sm:w-12" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** One numbered section of the checkout form, joined to the next by a thin thread. */
export function CheckoutStep({
  n,
  title,
  description,
  last,
  children,
}: {
  n: number;
  title: string;
  description?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  const id = `checkout-step-${n}`;
  return (
    <section aria-labelledby={id} className="grid grid-cols-[1.75rem_1fr] gap-x-4">
      <div className="flex flex-col items-center">
        <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
          {n}
        </span>
        {!last && <span aria-hidden className="mt-2 w-px flex-1 bg-outline-variant/70" />}
      </div>
      <div className={cn("grid content-start gap-4", !last && "pb-10")}>
        <div className="grid gap-0.5 pt-0.5">
          <h2 id={id} className="text-headline-md text-on-surface">
            {title}
          </h2>
          {description && <p className="text-body-md text-on-surface-variant">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
