import type { Metadata } from "next";
import { CreateInvoiceView } from "@/features/invoices/components/CreateInvoiceView";

export const metadata: Metadata = {
  title: "New Invoice | Boarding House",
  description: "Create an invoice for a lease in the Boarding House system",
};

export default function NewInvoice() {
  return <CreateInvoiceView />;
}
