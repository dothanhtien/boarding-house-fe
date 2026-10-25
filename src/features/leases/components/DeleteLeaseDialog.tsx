import React from "react";
import { HttpStatus } from "@/enums/httpStatus";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteLease } from "@/features/leases/mutations";
import type { Lease } from "@/features/leases/types";

interface DeleteLeaseDialogProps {
  lease: Lease;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteLeaseDialog: React.FC<DeleteLeaseDialogProps> = ({
  lease,
  onClose,
  onDeleted,
}) => {
  const deleteLeaseMutation = useDeleteLease();

  const handleClose = () => {
    deleteLeaseMutation.reset();
    onClose();
  };

  const handleConfirm = () => {
    deleteLeaseMutation.mutate(lease.id, {
      onSuccess: () => {
        handleClose();
        onDeleted?.();
        toast.success("Lease deleted successfully");
      },
      onError: (error) => {
        if (error.status === HttpStatus.NotFound) {
          toast.error(error.message);
          handleClose();
          onDeleted?.();
        }
      },
    });
  };

  return (
    <ConfirmDeleteDialog
      title="Delete lease"
      description={
        <>
          Are you sure you want to delete draft lease{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {lease.leaseCode}
          </span>{" "}
          for room {lease.roomNumber}? Its tenant list will be removed too. This
          action cannot be undone.
        </>
      }
      isPending={deleteLeaseMutation.isPending}
      errorMessage={deleteLeaseMutation.error?.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
};
