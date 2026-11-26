import type { Metadata } from "next";
import { MyLeaseDetailView } from "@/features/tenant-portal/components/MyLeaseDetailView";

export const metadata: Metadata = {
  title: "Lease details | Boarding House",
  description: "Lease details in the Boarding House tenant portal",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MyLeaseDetailView leaseId={id} />;
}
