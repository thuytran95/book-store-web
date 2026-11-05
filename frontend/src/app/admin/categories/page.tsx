import type { Metadata } from "next";
import { CategoriesPage } from "@/features/admin/components/category/categories-page";

export const metadata: Metadata = { title: "Thể loại sách" };

export default function AdminCategoriesPage() {
  return <CategoriesPage />;
}
