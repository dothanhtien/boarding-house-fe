import type { Metadata } from "next";
import { InvoiceDetailView } from "@/features/invoices/components/InvoiceDetailView";

export const metadata: Metadata = {
  title: "Invoice Details | Boarding House",
  description: "Invoice details page in the Boarding House system",
};

export default async function InvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InvoiceDetailView invoiceId={id} />;
}
