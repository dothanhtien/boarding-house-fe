import type { Metadata } from "next";
import { EditLeaseView } from "@/features/leases/components/EditLeaseView";
import { parseLeaseOrigin } from "@/features/leases/utils";

export const metadata: Metadata = {
  title: "Edit Lease | Boarding House",
  description: "Edit a draft lease in the Boarding House system",
};

export default async function EditLease({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ origin?: string | string[] }>;
}) {
  const { id } = await params;
  const { origin } = await searchParams;

  return <EditLeaseView leaseId={id} origin={parseLeaseOrigin(origin)} />;
}
