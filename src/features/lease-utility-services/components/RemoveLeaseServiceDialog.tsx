import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useRemoveLeaseUtilityService } from "@/features/lease-utility-services/mutations";
import type { LeaseUtilityService } from "@/features/lease-utility-services/types";
import { getStaleStateErrorMessage } from "@/features/lease-utility-services/utils";

interface RemoveLeaseServiceDialogProps {
  leaseId: string;
  service: LeaseUtilityService;
  onClose: () => void;
}

export const RemoveLeaseServiceDialog: React.FC<
  RemoveLeaseServiceDialogProps
> = ({ leaseId, service, onClose }) => {
  const removeMutation = useRemoveLeaseUtilityService();

  const handleConfirm = () => {
    removeMutation.mutate(
      { leaseId, serviceId: service.serviceId },
      {
        onSuccess: () => {
          onClose();
          toast.success("Service removed");
        },
        onError: (error) => {
          const staleMessage = getStaleStateErrorMessage(error);
          if (staleMessage) {
            toast.error(staleMessage);
            onClose();
          }
        },
      },
    );
  };

  return (
    <ConfirmDeleteDialog
      title="Remove service"
      description={
        <>
          Remove{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {service.name}
          </span>{" "}
          from this lease? You can add it again later.
        </>
      }
      isPending={removeMutation.isPending}
      errorMessage={removeMutation.error?.message}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};
