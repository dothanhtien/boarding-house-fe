import type { Metadata } from "next";
import { PropertyDetailView } from "@/features/properties/components/PropertyDetailView";

export const metadata: Metadata = {
  title: "Property | Boarding House",
  description:
    "Rooms and utility services of a property in the Boarding House system",
};

export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PropertyDetailView propertyId={id} />;
}
