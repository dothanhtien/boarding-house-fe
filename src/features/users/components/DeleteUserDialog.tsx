import React from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
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
    <Modal isOpen onClose={handleClose} className="m-4 max-w-[400px]">
      <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          Delete user
        </h4>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {user.fullName}
          </span>{" "}
          ({user.email})? This action cannot be undone.
        </p>

        {deleteUserMutation.isError && (
          <p className="text-error-500 mt-3 text-sm">
            {deleteUserMutation.error.message}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleteUserMutation.isPending}
            onClick={handleConfirm}
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
