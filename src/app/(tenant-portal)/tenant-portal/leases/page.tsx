import type { Metadata } from "next";
import { MyLeasesView } from "@/features/tenant-portal/components/MyLeasesView";

export const metadata: Metadata = {
  title: "My leases | Boarding House",
  description: "My leases in the Boarding House tenant portal",
};

export default function Page() {
  return <MyLeasesView />;
}
