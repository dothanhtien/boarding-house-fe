import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteProperty } from "@/features/properties/mutations";
import type { Property } from "@/features/properties/types";

interface DeletePropertyDialogProps {
  property: Property;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeletePropertyDialog({
  property,
  onClose,
  onDeleted,
}: DeletePropertyDialogProps) {
  const deletePropertyMutation = useDeleteProperty();

  function handleClose() {
    deletePropertyMutation.reset();
    onClose();
  }

  function handleConfirm() {
    deletePropertyMutation.mutate(property.id, {
      onSuccess: () => {
        handleClose();
        onDeleted?.();
        toast.success("Property deleted successfully");
      },
    });
  }

  return (
    <ConfirmDeleteDialog
      title="Delete property"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {property.name}
          </span>
          ? This action cannot be undone.
        </>
      }
      isPending={deletePropertyMutation.isPending}
      errorMessage={deletePropertyMutation.error?.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
