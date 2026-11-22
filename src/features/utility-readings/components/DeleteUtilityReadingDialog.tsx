import React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog/ConfirmDeleteDialog";
import { useDeleteUtilityReading } from "@/features/utility-readings/mutations";
import type { UtilityReading } from "@/features/utility-readings/types";
import { formatMeterValue } from "@/features/utility-readings/utils";

interface DeleteUtilityReadingDialogProps {
  roomNumber: string;
  reading: UtilityReading;
  onClose: () => void;
}

export const DeleteUtilityReadingDialog: React.FC<
  DeleteUtilityReadingDialogProps
> = ({ roomNumber, reading, onClose }) => {
  const deleteMutation = useDeleteUtilityReading();

  const handleConfirm = () => {
    deleteMutation.mutate(
      { roomId: reading.roomId, readingId: reading.id },
      {
        onSuccess: () => {
          onClose();
          toast.success("Reading deleted");
        },
      },
    );
  };

  return (
    <ConfirmDeleteDialog
      title="Delete reading"
      description={
        <>
          Delete the{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {reading.serviceName}
          </span>{" "}
          reading of room{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {roomNumber}
          </span>{" "}
          ({formatMeterValue(reading.currentValue)} {reading.unit})? You can
          enter it again afterwards.
        </>
      }
      isPending={deleteMutation.isPending}
      errorMessage={deleteMutation.error?.message}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};
