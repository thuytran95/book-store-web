import type { Metadata } from "next";
import { CategoriesPage } from "@/features/admin/components/categories-page";

export const metadata: Metadata = { title: "Danh mục" };

export default function AdminCategoriesPage() {
  return <CategoriesPage />;
}
