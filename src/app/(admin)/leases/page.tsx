import type { Metadata } from "next";
import { LeasesView } from "@/features/leases/components/LeasesView";

export const metadata: Metadata = {
  title: "Leases | Boarding House",
  description: "Lease management page in the Boarding House system",
};

export default function Leases() {
  return <LeasesView />;
}
