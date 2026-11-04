import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShopNotFound() {
  return (
    <div className="grid justify-items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold">Không tìm thấy</h1>
      <p className="text-sm text-muted-foreground">Sách hoặc trang này không tồn tại.</p>
      <Button render={<Link href="/books" />}>Xem sách</Button>
    </div>
  );
}
