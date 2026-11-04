import { MaterialIcon } from "@/features/home/components/material-icon";
import { cn } from "@/lib/utils";
import { PDP_TRUST_ITEMS } from "./pdp-static-copy";
import { pdpSurface } from "./pdp-styles";

type TrustItem = { icon: string; title: string; body: string };

export function BookDetailTrustGrid({
  items = [...PDP_TRUST_ITEMS],
}: {
  items?: TrustItem[];
}) {
  return (
    <div className={cn(pdpSurface(), "space-y-3.5 p-5")}>
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <MaterialIcon name="shield" className="text-xl text-primary" />
        Cam kết an tâm sưu tầm
      </div>
      <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-2.5">
            <MaterialIcon name={item.icon} className="shrink-0 text-xl text-secondary" />
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
