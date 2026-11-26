import type { Metadata } from "next";
import { MyPaymentsView } from "@/features/tenant-portal/components/MyPaymentsView";

export const metadata: Metadata = {
  title: "My payments | Boarding House",
  description: "My payments in the Boarding House tenant portal",
};

export default function Page() {
  return <MyPaymentsView />;
}
