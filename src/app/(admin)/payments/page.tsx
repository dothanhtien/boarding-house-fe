import type { Metadata } from "next";
import { PaymentsView } from "@/features/payments/components/PaymentsView";

export const metadata: Metadata = {
  title: "Payments | Boarding House",
  description: "Payments recorded for the organization's invoices",
};

export default function Payments() {
  return <PaymentsView />;
}
