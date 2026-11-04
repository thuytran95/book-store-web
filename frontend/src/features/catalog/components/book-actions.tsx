"use client";

import { Clock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/features/cart/hooks";
import { useReserve } from "@/features/reservations/hooks";
import { errorMessage } from "@/lib/error-messages";
import { useSession } from "@/lib/session";
import { toast } from "@/lib/toast";

type Props = { bookId: number; title: string; available: number; visible: boolean };

/** Add to cart / Reserve. Guests are sent to `/login?next=`; sold-out books offer a book request. */
export function BookActions({ bookId, title, available, visible }: Props) {
  const router = useRouter();
  const { session } = useSession();
  const add = useAddToCart();
  const reserve = useReserve();
  const soldOut = available <= 0 || !visible;

  if (soldOut) {
    return (
      <div className="grid gap-2">
        <p className="text-sm font-medium text-destructive">Sách này đã hết hàng.</p>
        <Button render={<Link href={`/book-requests?title=${encodeURIComponent(title)}`} />}>
          Yêu cầu tìm cuốn này
        </Button>
      </div>
    );
  }

  const requireLogin = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="lg"
        disabled={add.isPending}
        onClick={() => (session ? add.mutate({ bookId }) : requireLogin())}
      >
        <ShoppingCart /> Thêm vào giỏ
      </Button>
      <Button
        size="lg"
        variant="outline"
        disabled={reserve.isPending}
        onClick={() => {
          if (!session) return requireLogin();
          reserve.mutate(
            { bookId },
            {
              onSuccess: () => {
                toast.success("Đã giữ sách cho bạn");
                router.push("/reservations");
              },
              onError: (e) => toast.error(errorMessage(e)),
            },
          );
        }}
      >
        <Clock /> Giữ sách
      </Button>
    </div>
  );
}
