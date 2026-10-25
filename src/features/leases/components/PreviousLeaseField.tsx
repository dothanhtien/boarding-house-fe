"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import { LEASE_STATUS_LABELS } from "@/features/leases/constants";
import { useLease, useLeases } from "@/features/leases/queries";
import type { LeaseTermsFormValues } from "@/features/leases/schemas";
import { formatLeaseTerm } from "@/features/leases/utils";

interface PreviousLeaseFieldProps {
  roomId: string;
  excludeLeaseId?: string;
}

export const PreviousLeaseField: React.FC<PreviousLeaseFieldProps> = ({
  roomId,
  excludeLeaseId,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<LeaseTermsFormValues>();
  const previousLeaseId = useWatch({ control, name: "previousLeaseId" });
  const { data, isLoading } = useLeases(
    { roomId, pageSize: 100, sortBy: "startDate", sortOrder: "desc" },
    { enabled: !!roomId },
  );
  const leases = (data?.items ?? []).filter(
    (lease) => lease.id !== excludeLeaseId,
  );

  const isSelectedMissing =
    !!data &&
    !!previousLeaseId &&
    !leases.some((lease) => lease.id === previousLeaseId);
  const { data: selectedLease } = useLease(previousLeaseId, {
    enabled: isSelectedMissing,
  });
  if (isSelectedMissing && selectedLease?.id === previousLeaseId) {
    leases.push(selectedLease);
  }

  const options = leases.map((lease) => ({
    value: lease.id,
    label: `${lease.leaseCode} · ${formatLeaseTerm(lease)} · ${LEASE_STATUS_LABELS[lease.status]}`,
  }));

  const placeholder = !roomId
    ? "Select a room first"
    : isLoading
      ? "Loading leases..."
      : options.length === 0
        ? "No other leases for this room"
        : "None";

  return (
    <div>
      <Label htmlFor="previousLeaseId">Previous lease</Label>
      <Controller
        name="previousLeaseId"
        control={control}
        render={({ field }) => (
          <Select
            id="previousLeaseId"
            options={options}
            placeholder={placeholder}
            value={field.value}
            error={!!errors.previousLeaseId}
            onChange={field.onChange}
          />
        )}
      />
      <p
        className={`mt-1.5 text-xs ${errors.previousLeaseId ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}
      >
        {errors.previousLeaseId?.message ??
          "Set when this lease renews or replaces an earlier one."}
      </p>
    </div>
  );
};
