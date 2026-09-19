import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteOrganization } from "../mutations";
import type { Organization } from "../types";

interface DeleteOrganizationDialogProps {
  organization: Organization;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteOrganizationDialog({
  organization,
  onClose,
  onDeleted,
}: DeleteOrganizationDialogProps) {
  const deleteOrganizationMutation = useDeleteOrganization();

  function handleClose() {
    deleteOrganizationMutation.reset();
    onClose();
  }

  function handleConfirm() {
    deleteOrganizationMutation.mutate(organization.id, {
      onSuccess: () => {
        handleClose();
        onDeleted?.();
        toast.success("Organization deleted successfully");
      },
    });
  }

  return (
    <ConfirmDeleteDialog
      title="Delete organization"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {organization.name}
          </span>
          ? This action cannot be undone.
        </>
      }
      isPending={deleteOrganizationMutation.isPending}
      errorMessage={deleteOrganizationMutation.error?.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
