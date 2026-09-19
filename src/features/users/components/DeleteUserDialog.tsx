import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteUser } from "../mutations";
import type { User } from "../types";

interface DeleteUserDialogProps {
  user: User;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteUserDialog({
  user,
  onClose,
  onDeleted,
}: DeleteUserDialogProps) {
  const deleteUserMutation = useDeleteUser();

  function handleClose() {
    deleteUserMutation.reset();
    onClose();
  }

  function handleDeleteSuccess() {
    handleClose();
    onDeleted?.();
    toast.success("User deleted successfully");
  }

  function handleConfirm() {
    deleteUserMutation.mutate(user.id, { onSuccess: handleDeleteSuccess });
  }

  return (
    <ConfirmDeleteDialog
      title="Delete user"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {user.fullName}
          </span>{" "}
          ({user.email})? This action cannot be undone.
        </>
      }
      isPending={deleteUserMutation.isPending}
      errorMessage={deleteUserMutation.error?.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
