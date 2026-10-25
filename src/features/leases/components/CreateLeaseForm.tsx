"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { ROUTES } from "@/config/routeDefinition";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { formatCurrency } from "@/utils/currency";
import { toOptionalNumber } from "@/utils/forms";
import { LeaseOrigin } from "@/features/leases/constants";
import { useCreateLease } from "@/features/leases/mutations";
import {
  createLeaseSchema,
  type CreateLeaseFormValues,
} from "@/features/leases/schemas";
import { usePropertyLookup } from "@/features/properties/queries";
import { useRoom } from "@/features/rooms/queries";
import type { Room } from "@/features/rooms/types";
import { LeaseRoomFields } from "./LeaseRoomFields";
import { LeaseTenantsFields } from "./LeaseTenantsFields";
import { LeaseTermsFields } from "./LeaseTermsFields";
import { PreviousLeaseField } from "./PreviousLeaseField";

interface CreateLeaseFormProps {
  initialRoom?: Room;
  onCancel: () => void;
}

const buildDefaultValues = (room?: Room): CreateLeaseFormValues => ({
  propertyId: room?.propertyId ?? "",
  roomId: room?.id ?? "",
  previousLeaseId: "",
  leaseCode: "",
  startDate: "",
  endDate: "",
  billingDay: "",
  monthlyRent: "",
  depositAmount: "",
  tenants: [],
});

const priceHint = (label: string, room?: Room, amount?: number | null) => {
  if (!room) return `Leave blank to use the room's listed ${label}.`;
  return amount != null
    ? `Leave blank to use the room's ${label} (${formatCurrency(amount)}).`
    : `Required: the room has no listed ${label}.`;
};

export const CreateLeaseForm: React.FC<CreateLeaseFormProps> = ({
  initialRoom,
  onCancel,
}) => {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createLeaseMutation = useCreateLease();
  const isSubmitting =
    createLeaseMutation.isPending || createLeaseMutation.isSuccess;
  const form = useForm<CreateLeaseFormValues>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: buildDefaultValues(initialRoom),
    mode: "all",
  });

  const { data: properties = [] } = usePropertyLookup();
  const roomId = useWatch({ control: form.control, name: "roomId" });
  const { data: room } = useRoom(roomId, { enabled: !!roomId });
  const selectedRoom = room?.id === roomId ? room : undefined;

  const onSubmit = (values: CreateLeaseFormValues) => {
    if (isSubmitting) return;
    setGeneralError(null);

    let hasError = false;
    if (
      selectedRoom &&
      values.monthlyRent === "" &&
      selectedRoom.monthlyRent == null
    ) {
      form.setError("monthlyRent", {
        message: "Monthly rent is required because the room has no listed rent",
      });
      hasError = true;
    }
    if (
      selectedRoom &&
      values.depositAmount === "" &&
      selectedRoom.depositAmount == null
    ) {
      form.setError("depositAmount", {
        message:
          "Deposit amount is required because the room has no listed deposit",
      });
      hasError = true;
    }
    const capacity = selectedRoom?.capacity;
    if (capacity != null && values.tenants.length > capacity) {
      form.setError("tenants", {
        message: `The room allows at most ${capacity} tenants`,
      });
      hasError = true;
    }
    if (hasError) return;

    createLeaseMutation.mutate(
      {
        roomId: values.roomId,
        previousLeaseId: values.previousLeaseId || undefined,
        leaseCode: values.leaseCode.trim() || undefined,
        startDate: values.startDate,
        endDate: values.endDate || null,
        billingDay: toOptionalNumber(values.billingDay) ?? null,
        monthlyRent: toOptionalNumber(values.monthlyRent),
        depositAmount: toOptionalNumber(values.depositAmount),
        tenants: values.tenants.map((tenant) => ({
          userId: tenant.userId,
          isRepresentative: tenant.isRepresentative,
          joinedDate: tenant.joinedDate || null,
        })),
      },
      {
        onSuccess: (lease) => {
          toast.success("Lease created successfully");
          router.replace(
            ROUTES.leaseDetail(
              lease.id,
              initialRoom ? LeaseOrigin.Room : undefined,
            ),
          );
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(
              buildDefaultValues(),
            ) as (keyof CreateLeaseFormValues)[],
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
              The lease is created as a draft and can be edited until it is
              activated.
            </p>
          </div>

          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          {initialRoom ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoItem
                label="Property"
                value={
                  properties.find(
                    (property) => property.id === initialRoom.propertyId,
                  )?.name ?? "—"
                }
              />
              <InfoItem label="Room" value={`Room ${initialRoom.roomNumber}`} />
            </div>
          ) : (
            <LeaseRoomFields />
          )}

          <LeaseTermsFields
            isLeaseCodeOptional
            monthlyRentHint={priceHint(
              "rent",
              selectedRoom,
              selectedRoom?.monthlyRent,
            )}
            depositAmountHint={priceHint(
              "deposit",
              selectedRoom,
              selectedRoom?.depositAmount,
            )}
          />

          <PreviousLeaseField roomId={roomId} />
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
          <LeaseTenantsFields capacity={selectedRoom?.capacity} />
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create lease"}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};
