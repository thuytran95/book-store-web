import type { Metadata } from "next";
import { BooksTable } from "@/features/admin/components/book/books-table";

export const metadata: Metadata = { title: "Quản lý sách" };

export default function AdminBooksPage() {
  return <BooksTable />;
}
