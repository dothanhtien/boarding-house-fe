import type { Metadata } from "next";
import { CreateRoomView } from "@/features/rooms/components/CreateRoomView";

export const metadata: Metadata = {
  title: "Add Room | Boarding House",
  description: "Add a new room to a property in the Boarding House system",
};

export default async function CreateRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CreateRoomView propertyId={id} />;
}
