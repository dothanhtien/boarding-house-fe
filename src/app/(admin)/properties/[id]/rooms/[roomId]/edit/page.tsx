import type { Metadata } from "next";
import { EditRoomView } from "@/features/rooms/components/EditRoomView";

export const metadata: Metadata = {
  title: "Edit Room | Boarding House",
  description: "Edit a room of a property in the Boarding House system",
};

export default async function EditRoom({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id, roomId } = await params;

  return <EditRoomView propertyId={id} roomId={roomId} />;
}
