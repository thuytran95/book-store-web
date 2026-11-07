import type { Metadata } from "next";
import { AuthorsPage } from "@/features/admin/components/author/authors-page";

export const metadata: Metadata = { title: "Tác giả" };

export default function AdminAuthorsPage() {
  return <AuthorsPage />;
}
