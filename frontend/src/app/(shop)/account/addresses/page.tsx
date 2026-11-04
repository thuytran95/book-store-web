import type { Metadata } from "next";
import { AddressBook } from "@/features/account/components/address-book";

export const metadata: Metadata = { title: "Địa chỉ giao hàng" };

export default function AddressesPage() {
  return <AddressBook />;
}
