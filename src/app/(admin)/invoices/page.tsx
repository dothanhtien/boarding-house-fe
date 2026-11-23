import type { Metadata } from "next";
import { InvoicesView } from "@/features/invoices/components/InvoicesView";

export const metadata: Metadata = {
  title: "Invoices | Boarding House",
  description: "Invoices of the organization in the Boarding House system",
};

export default function Invoices() {
  return <InvoicesView />;
}
