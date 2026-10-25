import React, { useMemo } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import Button from "@/components/ui/button/Button";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { Modal } from "@/components/ui/modal";
import { useActivateLease } from "@/features/leases/mutations";
import type { Lease } from "@/features/leases/types";
import { formatLeaseTerm } from "@/features/leases/utils";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";

interface ActivateLeaseDialogProps {
  lease: Lease;
  onClose: () => void;
}

export const ActivateLeaseDialog: React.FC<ActivateLeaseDialogProps> = ({
  lease,
  onClose,
}) => {
  const activateLeaseMutation = useActivateLease();
  const isPending = activateLeaseMutation.isPending;

  const representative = useMemo(
    () => lease.tenants.find((tenant) => tenant.isRepresentative),
    [lease.tenants],
  );
  const startsInFuture = useMemo(
    () => lease.startDate.slice(0, 10) > dayjs().format(DateFormat.Date),
    [lease.startDate],
  );

  const handleClose = () => {
    if (isPending) return;
    activateLeaseMutation.reset();
    onClose();
  };

  const handleConfirm = () => {
    activateLeaseMutation.mutate(lease, {
      onSuccess: () => {
        activateLeaseMutation.reset();
        onClose();
        toast.success("Lease activated");
      },
    });
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      closeOnBackdropClick={!isPending}
      className="m-4 max-w-[480px]"
    >
      <div className="relative w-full max-w-[480px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          Activate lease
        </h4>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Activating marks the lease as signed. Review the terms before
          continuing.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <InfoItem label="Lease code" value={lease.leaseCode} />
          <InfoItem label="Room" value={`Room ${lease.roomNumber}`} />
          <div className="col-span-2">
            <InfoItem label="Term" value={formatLeaseTerm(lease)} />
          </div>
          <InfoItem
            label="Monthly rent"
            value={formatCurrency(lease.monthlyRent)}
          />
          <InfoItem
            label="Deposit amount"
            value={formatCurrency(lease.depositAmount)}
          />
          <div className="col-span-2">
            <InfoItem label="Representative" value={representative?.fullName} />
          </div>
        </div>

        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-gray-500 dark:text-gray-400">
          <li>
            The lease terms can no longer be edited and the lease can no longer
            be deleted.
          </li>
          <li>Room {lease.roomNumber} will be marked as occupied.</li>
          {startsInFuture && (
            <li>
              {`The lease starts on ${formatDate(lease.startDate, DateFormat.Date)}.`}
            </li>
          )}
        </ul>

        {activateLeaseMutation.error && (
          <p className="text-error-500 mt-3 text-sm">
            {activateLeaseMutation.error.message}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Activating..." : "Activate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
