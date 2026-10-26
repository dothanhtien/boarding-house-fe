"use client";

import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Radio from "@/components/form/input/Radio";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useUpsertLeaseUtilityService } from "@/features/lease-utility-services/mutations";
import {
  leaseServicePriceSchema,
  type LeaseServicePriceFormValues,
} from "@/features/lease-utility-services/schemas";
import type { LeaseUtilityService } from "@/features/lease-utility-services/types";
import { getStaleStateErrorMessage } from "@/features/lease-utility-services/utils";
import {
  formatUnitPrice,
  supportsQuantity,
} from "@/features/utility-services/utils";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";

interface LeaseServicePriceModalProps {
  leaseId: string;
  isLeaseActive: boolean;
  service: LeaseUtilityService;
  onClose: () => void;
}

const FORM_FIELDS: (keyof LeaseServicePriceFormValues)[] = [
  "unitPriceOverride",
  "quantity",
];

export const LeaseServicePriceModal: React.FC<LeaseServicePriceModalProps> = ({
  leaseId,
  isLeaseActive,
  service,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const upsertMutation = useUpsertLeaseUtilityService();
  const isPending = upsertMutation.isPending;
  const hasQuantity = supportsQuantity(service.billingMethod);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<LeaseServicePriceFormValues>({
    resolver: zodResolver(leaseServicePriceSchema),
    defaultValues: {
      useDefault: service.unitPriceOverride === null,
      unitPriceOverride: service.unitPriceOverride?.toString() ?? "",
      quantity: service.quantity.toString(),
    },
    mode: "all",
  });
  const useDefault = useWatch({ control, name: "useDefault" });

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: LeaseServicePriceFormValues) => {
    setGeneralError(null);

    upsertMutation.mutate(
      {
        leaseId,
        serviceId: service.serviceId,
        payload: {
          unitPriceOverride: values.useDefault
            ? null
            : Number(values.unitPriceOverride),
          ...(hasQuantity && { quantity: Number(values.quantity) }),
        },
      },
      {
        onSuccess: () => {
          toast.success(`${service.name} updated successfully`);
          onClose();
        },
        onError: (error: ApiError) => {
          const staleMessage = getStaleStateErrorMessage(error);
          if (staleMessage) {
            toast.error(staleMessage);
            onClose();
            return;
          }
          applyApiFormErrors(error, FORM_FIELDS, setError, setGeneralError);
        },
      },
    );
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[480px]"
      closeOnBackdropClick={false}
    >
      <div className="relative w-full rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          Edit {service.name}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the property&apos;s default price or agree on a price for this
          lease.
        </p>

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col gap-4">
            {generalError && (
              <p className="text-error-500 text-sm">{generalError}</p>
            )}

            <Controller
              name="useDefault"
              control={control}
              render={({ field }) => (
                <div role="radiogroup" className="flex flex-col gap-4">
                  <Radio
                    id="price-default"
                    name="useDefault"
                    value="default"
                    checked={field.value}
                    disabled={isPending}
                    label={`Use the default price (${formatUnitPrice(service.defaultUnitPrice, service.unit)})`}
                    onChange={() => field.onChange(true)}
                  />
                  <Radio
                    id="price-custom"
                    name="useDefault"
                    value="custom"
                    checked={!field.value}
                    disabled={isPending}
                    label="Custom price"
                    onChange={() => field.onChange(false)}
                  />
                </div>
              )}
            />

            {!useDefault && (
              <div className="pl-8">
                <Input
                  id="unitPriceOverride"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder={`Price per ${service.unit}`}
                  disabled={isPending}
                  error={!!errors.unitPriceOverride}
                  hint={errors.unitPriceOverride?.message}
                  {...register("unitPriceOverride")}
                />
              </div>
            )}

            {hasQuantity && (
              <div>
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  disabled={isPending}
                  error={!!errors.quantity}
                  hint={
                    errors.quantity?.message ??
                    "Billed every month: price × quantity."
                  }
                  {...register("quantity")}
                />
              </div>
            )}

            {isLeaseActive && (
              <p className="text-warning-500 text-sm">
                Applies to meter readings and invoices created from now on.
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
