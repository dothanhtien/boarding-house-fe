import type { Metadata } from "next";
import { LeaseDetailView } from "@/features/leases/components/LeaseDetailView";
import { parseLeaseOrigin } from "@/features/leases/utils";

export const metadata: Metadata = {
  title: "Lease Details | Boarding House",
  description: "Lease details page in the Boarding House system",
};

export default async function LeaseDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ origin?: string | string[] }>;
}) {
  const { id } = await params;
  const { origin } = await searchParams;

  return <LeaseDetailView leaseId={id} origin={parseLeaseOrigin(origin)} />;
}
