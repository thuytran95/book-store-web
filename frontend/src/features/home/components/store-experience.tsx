import type { StoreSection } from "@/config/home";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

export function StoreExperience({ content }: { content: StoreSection }) {
  return (
    <section className="w-full bg-white py-12" id="khong-gian">
      <div className="mx-auto max-w-page px-4">
        <div className="rounded-2xl border border-gray-200 bg-surface-container-low p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wider text-emerald-900 uppercase">
                <MaterialIcon name="location_on" className="text-sm" />
                {content.eyebrow}
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{content.title}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{content.body}</p>
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <MaterialIcon name="map" className="mb-1 text-2xl text-primary" />
                  <p className="text-xs font-bold text-gray-900">{content.addressCard.title}</p>
                  <p className="mt-0.5 text-xs text-gray-600">{content.addressCard.address}</p>
                  <p className="mt-1 text-[11px] font-bold text-emerald-700">
                    {content.addressCard.hours}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <MaterialIcon name="local_cafe" className="mb-1 text-2xl text-primary" />
                  <p className="text-xs font-bold text-gray-900">{content.teaCard.title}</p>
                  <p className="mt-0.5 text-xs text-gray-600">{content.teaCard.line1}</p>
                  <p className="mt-1 text-[11px] font-bold text-amber-700">{content.teaCard.line2}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:col-span-6">
              {content.galleryImages.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.url}
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  className={cn(
                    "h-44 w-full rounded-xl object-cover shadow-sm transition-transform duration-300 hover:scale-105",
                    img.wide && "col-span-2 h-36",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
