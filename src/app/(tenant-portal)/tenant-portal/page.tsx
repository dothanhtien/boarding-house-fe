import type { Metadata } from "next";
import { MyOverviewView } from "@/features/tenant-portal/components/MyOverviewView";

export const metadata: Metadata = {
  title: "My rentals | Boarding House",
  description: "My rentals in the Boarding House tenant portal",
};

export default function Page() {
  return <MyOverviewView />;
}
