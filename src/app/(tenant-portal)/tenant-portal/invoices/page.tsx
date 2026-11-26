import type { Metadata } from "next";
import { MyInvoicesView } from "@/features/tenant-portal/components/MyInvoicesView";

export const metadata: Metadata = {
  title: "My invoices | Boarding House",
  description: "My invoices in the Boarding House tenant portal",
};

export default function Page() {
  return <MyInvoicesView />;
}
