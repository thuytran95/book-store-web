import type { TrustPillar } from "@/config/home";
import { MaterialIcon } from "./material-icon";

export function TrustPillars({ items }: { items: TrustPillar[] }) {
  return (
    <section className="w-full border-b border-gray-100 bg-white py-6">
      <div className="mx-auto max-w-page px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcon name={item.icon} className="text-2xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                <p className="mt-0.5 text-xs text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
