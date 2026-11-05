import Link from "next/link";
import { homeContent, homeCopyrightLine } from "@/config/home";
import { MaterialIcon } from "./material-icon";

export function HomeFooter() {
  const { brand, shop, footerQuickLinks, footerPolicyLinks, footerLegalLinks, socialLinks } =
    homeContent;

  return (
    <footer className="w-full border-t border-gray-800 bg-[#18231e] pt-12 pb-8 text-gray-300">
      <div className="mx-auto max-w-page px-4">
        <div className="grid grid-cols-1 gap-8 border-b border-gray-800 pb-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <MaterialIcon name="menu_book" className="text-2xl text-primary-fixed" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white">{brand.name}</h3>
                <p className="text-[10px] font-bold tracking-widest text-primary-fixed-dim uppercase">
                  {brand.footerTagline}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">{brand.blurb}</p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white transition-colors hover:bg-primary"
                >
                  {s.abbrev}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">
              Cần hỗ trợ bạn hữu?
            </h4>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p className="text-lg font-extrabold text-amber-400">{shop.hotline}</p>
              <p className="text-[11px]">{shop.hoursLong}</p>
              <p className="pt-1 text-[11px] text-gray-400">{shop.zaloNote}</p>
              <p className="flex items-center gap-1.5 pt-2 font-medium text-white">
                <MaterialIcon name="location_on" className="text-sm text-emerald-400" />
                {shop.addressShort}
              </p>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">Kho sách</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {footerQuickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">
              Chính sách & ký gửi
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {footerPolicyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>{homeCopyrightLine()}</p>
          <div className="flex items-center gap-4 text-[11px]">
            {footerLegalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-gray-300">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
