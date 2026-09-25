import type { Metadata } from "next";
import { RoomDetailView } from "@/features/rooms/components/RoomDetailView";

export const metadata: Metadata = {
  title: "Room Details | Boarding House",
  description: "Room details page for a property in the Boarding House system",
};

export default async function RoomDetail({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id, roomId } = await params;

  return <RoomDetailView propertyId={id} roomId={roomId} />;
}
