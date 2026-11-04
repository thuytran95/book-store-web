import { PriceTag } from "@/components/shared/badges";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { cn } from "@/lib/utils";
import { PDP_STATIC } from "./pdp-static-copy";
import { pdpSurface } from "./pdp-styles";

export function BookDetailPricingPromo({
  salePrice,
  promoNote = PDP_STATIC.preservationPerk,
}: {
  salePrice: number;
  promoNote?: string;
}) {
  return (
    <div className="grid gap-4">
      <div className={cn(pdpSurface(), "space-y-3 p-5")}>
        <PriceTag amount={salePrice} size="lg" className="text-headline-xl-mobile md:text-headline-xl" />
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/80 p-3 text-sm text-muted-foreground">
          <MaterialIcon name="card_giftcard" className="shrink-0 text-xl text-secondary" />
          <p>{promoNote}</p>
        </div>
      </div>
      <div className={cn(pdpSurface(), "space-y-3 p-5")}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">Mã ưu đãi dành riêng cho ấn phẩm này</span>
          <span className="text-xs text-muted-foreground">Xem tất cả ({PDP_STATIC.voucherChips.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PDP_STATIC.voucherChips.map((v) => (
            <div
              key={v.code}
              className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm"
            >
              <span className="font-bold tracking-wide text-primary">{v.code}</span>
              <span className="text-muted-foreground">{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
