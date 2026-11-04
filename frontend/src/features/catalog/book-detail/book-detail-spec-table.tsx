import type { SpecRow } from "./formatters";
import { pdpSurface } from "./pdp-styles";

export function BookDetailSpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <section className={pdpSurface() + " overflow-hidden p-5"} aria-labelledby="pdp-spec-heading">
      <h2 id="pdp-spec-heading" className="mb-4 text-headline-md font-semibold">
        Bảng thông số giám định
      </h2>
      <dl className="grid gap-0 sm:grid-cols-3">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={
              i % 2 === 0
                ? "col-span-full grid grid-cols-1 gap-1 border-b border-border/60 bg-muted/30 px-4 py-3 sm:grid-cols-3 sm:gap-4"
                : "col-span-full grid grid-cols-1 gap-1 border-b border-border/60 px-4 py-3 sm:grid-cols-3 sm:gap-4"
            }
          >
            <dt className="text-sm font-medium text-muted-foreground sm:col-span-1">{row.label}</dt>
            <dd className="text-sm font-medium sm:col-span-2">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
