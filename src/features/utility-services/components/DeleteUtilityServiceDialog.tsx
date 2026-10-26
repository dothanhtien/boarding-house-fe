import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { HttpStatus } from "@/enums/httpStatus";
import { useDeleteUtilityService } from "@/features/utility-services/mutations";
import type { UtilityService } from "@/features/utility-services/types";

interface DeleteUtilityServiceDialogProps {
  service: UtilityService;
  onClose: () => void;
}

export const DeleteUtilityServiceDialog: React.FC<
  DeleteUtilityServiceDialogProps
> = ({ service, onClose }) => {
  const deleteMutation = useDeleteUtilityService();

  const handleConfirm = () => {
    deleteMutation.mutate(service.id, {
      onSuccess: () => {
        onClose();
        toast.success("Service deleted successfully");
      },
      onError: (error) => {
        if (error.status === HttpStatus.NotFound) {
          toast.error(error.message);
          onClose();
        }
      },
    });
  };

  return (
    <ConfirmDeleteDialog
      title="Delete utility service"
      description={
        <>
          Delete{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {service.name}
          </span>
          ? Deleted services can&apos;t be added to leases again. Leases that
          already use it keep it. To stop offering it, turn it off instead.
        </>
      }
      isPending={deleteMutation.isPending}
      errorMessage={deleteMutation.error?.message}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};
