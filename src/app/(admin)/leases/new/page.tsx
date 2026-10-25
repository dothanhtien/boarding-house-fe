import type { Metadata } from "next";
import { CreateLeaseView } from "@/features/leases/components/CreateLeaseView";

export const metadata: Metadata = {
  title: "New Lease | Boarding House",
  description: "Create a new lease in the Boarding House system",
};

export default async function CreateLease({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string | string[] }>;
}) {
  const { roomId } = await searchParams;

  return (
    <CreateLeaseView
      initialRoomId={typeof roomId === "string" ? roomId : undefined}
    />
  );
}
