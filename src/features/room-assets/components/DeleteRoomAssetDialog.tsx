import React from "react";
import { HttpStatus } from "@/enums/httpStatus";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteRoomAsset } from "@/features/room-assets/mutations";
import type { RoomAsset } from "@/features/room-assets/types";

interface DeleteRoomAssetDialogProps {
  asset: RoomAsset;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteRoomAssetDialog: React.FC<DeleteRoomAssetDialogProps> = ({
  asset,
  onClose,
  onDeleted,
}) => {
  const deleteRoomAssetMutation = useDeleteRoomAsset();

  const handleClose = () => {
    deleteRoomAssetMutation.reset();
    onClose();
  };

  const handleConfirm = () => {
    deleteRoomAssetMutation.mutate(
      { roomId: asset.roomId, assetId: asset.id },
      {
        onSuccess: () => {
          handleClose();
          onDeleted?.();
          toast.success("Asset deleted successfully");
        },
        onError: (error) => {
          if (error.status === HttpStatus.NotFound) {
            toast.error(error.message);
            handleClose();
            onDeleted?.();
          }
        },
      },
    );
  };

  return (
    <ConfirmDeleteDialog
      title="Delete asset"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {asset.name}
          </span>
          ? Its condition history and photos will be removed too. This action
          cannot be undone.
        </>
      }
      isPending={deleteRoomAssetMutation.isPending}
      errorMessage={deleteRoomAssetMutation.error?.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
};
