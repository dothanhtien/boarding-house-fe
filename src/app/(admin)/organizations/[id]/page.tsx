import type { Metadata } from "next";
import { OrganizationEditView } from "@/features/organizations/components/OrganizationEditView";

export const metadata: Metadata = {
  title: "Edit organization | Boarding House",
  description:
    "Edit organization details and settings in the Boarding House system",
};

export default async function EditOrganization({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrganizationEditView organizationId={id} />;
}
