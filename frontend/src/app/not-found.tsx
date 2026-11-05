import { LinkButton } from "@/components/shared/link-button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="text-sm text-muted-foreground">Đường dẫn không tồn tại hoặc sách đã bị ẩn.</p>
        <LinkButton href="/">Về trang chủ</LinkButton>
      </div>
    </main>
  );
}
