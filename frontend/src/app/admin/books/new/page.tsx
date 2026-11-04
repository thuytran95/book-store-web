import type { Metadata } from "next";
import { BookForm } from "@/features/admin/components/book-form";

export const metadata: Metadata = { title: "Thêm sách" };

export default function NewBookPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Thêm sách</h1>
      <BookForm />
    </div>
  );
}
