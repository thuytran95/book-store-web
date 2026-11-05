"use client";

import { useParams } from "next/navigation";
import { BookForm } from "@/features/admin/components/book/book-form";

export default function EditBookPage() {
  const id = Number(useParams().id);
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Sửa sách</h1>
      <BookForm bookId={id} />
    </div>
  );
}
