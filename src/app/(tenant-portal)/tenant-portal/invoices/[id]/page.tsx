import type { Metadata } from "next";
import { MyInvoiceDetailView } from "@/features/tenant-portal/components/MyInvoiceDetailView";

export const metadata: Metadata = {
  title: "Invoice details | Boarding House",
  description: "Invoice details in the Boarding House tenant portal",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MyInvoiceDetailView invoiceId={id} />;
}
