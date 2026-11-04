import Link from "next/link";
import { homeContent } from "@/config/home";
import { MaterialIcon } from "@/features/home/components/material-icon";

export function HomeTopbar() {
  const { shop } = homeContent;

  return (
    <div className="border-b border-primary/20 bg-primary-container px-4 py-2 text-xs text-white">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4 text-primary-fixed-dim">
          <span className="flex items-center gap-1.5 font-medium text-white">
            <MaterialIcon
              name="storefront"
              className="text-sm text-primary-fixed"
            />
            {shop.address}
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden items-center gap-1 text-white/90 md:flex">
            <MaterialIcon name="schedule" className="text-sm text-amber-300" />
            Mở cửa đón bạn hữu: {shop.topbarHours}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link
            href="/orders"
            className="flex items-center gap-1 transition-colors hover:text-primary-fixed"
          >
            <MaterialIcon name="local_shipping" className="text-sm" />
            Tra Cứu Đơn Hàng
          </Link>
          <Link
            href="/account/profile"
            className="flex items-center gap-1 transition-colors hover:text-primary-fixed"
          >
            <MaterialIcon name="person" className="text-sm" />
            Tài Khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
