"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useUpdateLease } from "@/features/leases/mutations";
import {
  updateLeaseSchema,
  type UpdateLeaseFormValues,
} from "@/features/leases/schemas";
import type { Lease, UpdateLeasePayload } from "@/features/leases/types";
import { buildTenantChanges } from "@/features/leases/utils";
import { usePropertyLookup } from "@/features/properties/queries";
import { useRoom } from "@/features/rooms/queries";
import { LeaseStatusBadge } from "./LeaseStatusBadge";
import { LeaseTenantsFields } from "./LeaseTenantsFields";
import { LeaseTermsFields } from "./LeaseTermsFields";
import { PreviousLeaseField } from "./PreviousLeaseField";

interface EditLeaseFormProps {
  lease: Lease;
  onDone: () => void;
}

const buildDefaultValues = (lease: Lease): UpdateLeaseFormValues => ({
  previousLeaseId: lease.previousLeaseId ?? "",
  leaseCode: lease.leaseCode,
  startDate: lease.startDate,
  endDate: lease.endDate ?? "",
  billingDay: lease.billingDay?.toString() ?? "",
  monthlyRent: lease.monthlyRent.toString(),
  depositAmount: lease.depositAmount.toString(),
  tenants: lease.tenants.map((tenant) => ({
    tenantId: tenant.id,
    userId: tenant.userId,
    fullName: tenant.fullName,
    phone: tenant.phone ?? "",
    isRepresentative: tenant.isRepresentative,
    joinedDate: tenant.joinedDate ?? "",
  })),
});

export const EditLeaseForm: React.FC<EditLeaseFormProps> = ({
  lease,
  onDone,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [initialTenants] = useState(lease.tenants);
  const updateLeaseMutation = useUpdateLease();
  const { data: room } = useRoom(lease.roomId);
  const { data: properties = [] } = usePropertyLookup();
  const isSubmitting =
    updateLeaseMutation.isPending || updateLeaseMutation.isSuccess;
  const form = useForm<UpdateLeaseFormValues>({
    resolver: zodResolver(updateLeaseSchema),
    defaultValues: buildDefaultValues(lease),
    mode: "all",
  });
  const {
    formState: { dirtyFields },
  } = form;

  const onSubmit = (values: UpdateLeaseFormValues) => {
    if (isSubmitting) return;
    setGeneralError(null);
    setWarning(null);

    const capacity = room?.capacity;
    if (capacity != null && values.tenants.length > capacity) {
      form.setError("tenants", {
        message: `The room allows at most ${capacity} tenants`,
      });
      return;
    }

    const payload: UpdateLeasePayload = {};
    if (dirtyFields.previousLeaseId)
      payload.previousLeaseId = values.previousLeaseId || null;
    if (dirtyFields.leaseCode) payload.leaseCode = values.leaseCode.trim();
    if (dirtyFields.startDate) payload.startDate = values.startDate;
    if (dirtyFields.endDate) payload.endDate = values.endDate || null;
    if (dirtyFields.billingDay)
      payload.billingDay =
        values.billingDay === "" ? null : Number(values.billingDay);
    if (dirtyFields.monthlyRent)
      payload.monthlyRent = Number(values.monthlyRent);
    if (dirtyFields.depositAmount)
      payload.depositAmount = Number(values.depositAmount);

    const tenantChanges = buildTenantChanges(initialTenants, values.tenants);
    if (tenantChanges.length > 0) payload.tenants = tenantChanges;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateLeaseMutation.mutate(
      { id: lease.id, payload },
      {
        onSuccess: () => {
          toast.success("Lease updated successfully");
          onDone();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(
              buildDefaultValues(lease),
            ) as (keyof UpdateLeaseFormValues)[],
            form.setError,
            setGeneralError,
          );
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Lease information
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update the draft lease&apos;s terms and tenants. The room
              can&apos;t be changed after the lease is created.
            </p>
          </div>

          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          {warning && <p className="text-warning-500 text-sm">{warning}</p>}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <InfoItem
              label="Property"
              value={
                properties.find((property) => property.id === lease.propertyId)
                  ?.name ?? "—"
              }
            />
            <InfoItem label="Room" value={`Room ${lease.roomNumber}`} />
            <InfoItem
              label="Status"
              value={<LeaseStatusBadge status={lease.status} />}
            />
          </div>

          <LeaseTermsFields />

          <PreviousLeaseField roomId={lease.roomId} excludeLeaseId={lease.id} />
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
          <LeaseTenantsFields capacity={room?.capacity} />
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onDone}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};
