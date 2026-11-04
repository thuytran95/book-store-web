import type { Metadata } from "next";
import { ReservationList } from "@/features/reservations/components/reservation-list";

export const metadata: Metadata = { title: "Sách đang giữ" };

export default function ReservationsPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Sách đang giữ</h1>
      <ReservationList />
    </div>
  );
}
