"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { LeaseStatus } from "@/features/leases/constants";
import { useLeases } from "@/features/leases/queries";
import type { UtilityServicePreset } from "@/features/utility-services/constants";
import { useCreateUtilityService } from "@/features/utility-services/mutations";
import {
  createUtilityServiceSchema,
  type CreateUtilityServiceFormValues,
} from "@/features/utility-services/schemas";
import {
  getDefaultsForType,
  isDuplicateNameError,
} from "@/features/utility-services/utils";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { UtilityServiceFormFields } from "./UtilityServiceFormFields";

interface CreateUtilityServiceModalProps {
  propertyId: string;
  preset?: UtilityServicePreset;
  onClose: () => void;
}

const buildDefaultValues = (
  preset?: UtilityServicePreset,
): CreateUtilityServiceFormValues => ({
  name: preset?.name ?? "",
  type: preset?.type ?? "",
  billingMethod: "",
  unit: "",
  defaultUnitPrice: "",
  ...(preset && getDefaultsForType(preset.type)),
});

const FORM_FIELDS = Object.keys(
  buildDefaultValues(),
) as (keyof CreateUtilityServiceFormValues)[];

export const CreateUtilityServiceModal: React.FC<
  CreateUtilityServiceModalProps
> = ({ propertyId, preset, onClose }) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { data: activeLeases } = useLeases({
    propertyId,
    status: LeaseStatus.Active,
    pageSize: 1,
  });
  const { data: draftLeases } = useLeases({
    propertyId,
    status: LeaseStatus.Draft,
    pageSize: 1,
  });
  const hasOpenLeases =
    (activeLeases?.totalItems ?? 0) + (draftLeases?.totalItems ?? 0) > 0;
  const createMutation = useCreateUtilityService();
  const isPending = createMutation.isPending;
  const form = useForm<CreateUtilityServiceFormValues>({
    resolver: zodResolver(createUtilityServiceSchema),
    defaultValues: buildDefaultValues(preset),
    mode: "all",
  });

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: CreateUtilityServiceFormValues) => {
    if (values.type === "" || values.billingMethod === "") return;
    setGeneralError(null);

    createMutation.mutate(
      {
        propertyId,
        name: values.name.trim(),
        type: values.type,
        billingMethod: values.billingMethod,
        unit: values.unit.trim(),
        defaultUnitPrice: Number(values.defaultUnitPrice),
      },
      {
        onSuccess: () => {
          toast.success(
            "Service added successfully",
            hasOpenLeases
              ? {
                  description:
                    "Existing leases don't include it automatically — add it from the lease page.",
                }
              : undefined,
          );
          onClose();
        },
        onError: (error: ApiError) => {
          if (isDuplicateNameError(error)) {
            form.setError("name", { message: error.message });
            return;
          }
          applyApiFormErrors(
            error,
            FORM_FIELDS,
            form.setError,
            setGeneralError,
          );
        },
      },
    );
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[640px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[640px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Add utility service
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Set up a service and how it is charged for this property.
        </p>

        <FormProvider {...form}>
          <Form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
              {generalError && (
                <p className="text-error-500 text-sm">{generalError}</p>
              )}

              <UtilityServiceFormFields />
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
                {isPending ? "Adding..." : "Add service"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </Modal>
  );
};
