import type { Metadata } from "next";
import { AdminReservationsPage } from "@/features/admin/components/reservations-page";

export const metadata: Metadata = { title: "Giữ sách" };

export default function Page() {
  return <AdminReservationsPage />;
}
