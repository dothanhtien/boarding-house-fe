import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteRoom } from "@/features/rooms/mutations";
import type { Room } from "@/features/rooms/types";

interface DeleteRoomDialogProps {
  room: Room;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteRoomDialog({
  room,
  onClose,
  onDeleted,
}: DeleteRoomDialogProps) {
  const deleteRoomMutation = useDeleteRoom();

  function handleClose() {
    deleteRoomMutation.reset();
    onClose();
  }

  function handleConfirm() {
    deleteRoomMutation.mutate(room.id, {
      onSuccess: () => {
        handleClose();
        onDeleted?.();
        toast.success("Room deleted successfully");
      },
    });
  }

  return (
    <ConfirmDeleteDialog
      title="Delete room"
      description={
        <>
          Are you sure you want to delete room{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {room.roomNumber}
          </span>
          ? This action cannot be undone.
        </>
      }
      isPending={deleteRoomMutation.isPending}
      errorMessage={deleteRoomMutation.error?.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
