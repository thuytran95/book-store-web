"use client";

import { useParams } from "next/navigation";
import { BookForm } from "@/features/admin/components/book/book-form";

export default function EditBookPage() {
  const id = Number(useParams().id);
  return (
    <div className="w-full max-w-[90%] flex flex-col gap-4 mx-auto rounded-lg bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(27,77,62,0.06)]">
      <h1 className="text-2xl font-bold">Sửa sách</h1>
      <BookForm bookId={id} />
    </div>
  );
}
