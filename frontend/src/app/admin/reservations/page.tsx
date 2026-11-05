import type { Metadata } from "next";
import { AdminReservationsPage } from "@/features/admin/components/reservation/reservations-page";

export const metadata: Metadata = { title: "Giữ sách" };

export default function Page() {
  return <AdminReservationsPage />;
}
