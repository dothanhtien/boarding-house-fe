import type { Metadata } from "next";
import { OrganizationsView } from "@/features/organizations/components/OrganizationsView";

export const metadata: Metadata = {
  title: "Organizations | Boarding House",
  description: "Organization management page in the Boarding House system",
};

export default function Organizations() {
  return <OrganizationsView />;
}
