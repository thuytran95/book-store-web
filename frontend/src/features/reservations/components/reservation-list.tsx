"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/error-messages";
import { formatDate, reservationStatusLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useCancelReservation, useCountdown, useReservations, type Reservation } from "../hooks/use-reservations";
import { LinkButton } from "@/components/shared/link-button";

function CountdownText({ expiresAt }: { expiresAt: string }) {
  const c = useCountdown(expiresAt);
  if (c.expired) return <span className="text-destructive">Đã hết hạn</span>;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (c.days > 0) return <span>Còn {c.days} ngày {c.hours} giờ</span>;
  return (
    <span>
      Còn {pad(c.hours)}:{pad(c.minutes)}:{pad(c.seconds)}
    </span>
  );
}

function Row({ r, onCancel }: { r: Reservation; onCancel: (r: Reservation) => void }) {
  const expired = r.status !== "active" || new Date(r.expires_at).getTime() <= Date.now();
  const href = r.book_slug ? `/books/${r.book_slug}` : "/books";

  return (
    <li className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-3", expired && "opacity-70")}>
      <Link href={href} className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {r.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.cover_url} alt="" className="size-full object-cover" />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1 grid gap-0.5">
        <Link href={href} className="font-medium hover:underline">
          {r.book_title || `Sách #${r.book_id}`}
        </Link>
        <p className="text-sm text-muted-foreground">
          {reservationStatusLabel(r.status)} · SL {r.quantity}
        </p>
        {r.status === "active" ? (
          <p className="text-sm">
            <CountdownText expiresAt={r.expires_at} />
            <span className="text-muted-foreground"> · hết hạn {formatDate(r.expires_at)}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Hết hạn {formatDate(r.expires_at)}</p>
        )}
      </div>
      <div className="flex gap-2">
        {r.status === "active" && !expired && (
          <>
            <LinkButton href={`/checkout?reservation=${r.id}`} size="sm">
              Mua ngay
            </LinkButton>
            <Button size="sm" variant="outline" onClick={() => onCancel(r)}>
              Huỷ giữ
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export function ReservationList() {
  const { data, isLoading, error } = useReservations();
  const cancel = useCancelReservation();
  const [target, setTarget] = useState<Reservation | null>(null);

  if (isLoading) return <Skeleton className="h-48" />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) {
    return (
      <EmptyState
        title="Bạn chưa giữ cuốn sách nào"
        description="Giữ sách khi chưa sẵn sàng mua ngay. Mỗi lượt giữ có hạn."
        action={<LinkButton href="/books">Xem sách</LinkButton>}
      />
    );
  }

  return (
    <>
      <ul className="grid gap-3">
        {data.map((r) => (
          <Row key={r.id} r={r} onCancel={setTarget} />
        ))}
      </ul>
      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Huỷ lượt giữ sách?"
        message="Sách sẽ được mở bán lại cho người khác."
        destructive
        confirmLabel="Huỷ giữ"
        loading={cancel.isPending}
        onConfirm={() =>
          target &&
          cancel.mutate(target.id, {
            onSuccess: () => {
              toast.success("Đã huỷ lượt giữ sách");
              setTarget(null);
            },
            onError: (e) => {
              toast.error(errorMessage(e));
              setTarget(null);
            },
          })
        }
      />
    </>
  );
}
