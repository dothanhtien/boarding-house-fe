import type { Metadata } from "next";
import { RoomsView } from "@/features/rooms/components/RoomsView";

export const metadata: Metadata = {
  title: "Rooms | Boarding House",
  description:
    "Room management page for a property in the Boarding House system",
};

export default async function PropertyRooms({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RoomsView propertyId={id} />;
}
