"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useUpdateUtilityService } from "@/features/utility-services/mutations";
import {
  updateUtilityServiceSchema,
  type CreateUtilityServiceFormValues,
  type UpdateUtilityServiceFormValues,
} from "@/features/utility-services/schemas";
import type { UtilityService } from "@/features/utility-services/types";
import {
  buildUpdateUtilityServicePayload,
  isDuplicateNameError,
} from "@/features/utility-services/utils";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { UtilityServiceFormFields } from "./UtilityServiceFormFields";

interface EditUtilityServiceModalProps {
  service: UtilityService;
  onClose: () => void;
}

const buildDefaultValues = (
  service: UtilityService,
): CreateUtilityServiceFormValues => ({
  name: service.name,
  type: service.type,
  billingMethod: service.billingMethod,
  unit: service.unit,
  defaultUnitPrice: service.defaultUnitPrice.toString(),
});

const FORM_FIELDS: (keyof UpdateUtilityServiceFormValues)[] = [
  "name",
  "billingMethod",
  "unit",
  "defaultUnitPrice",
];

export const EditUtilityServiceModal: React.FC<
  EditUtilityServiceModalProps
> = ({ service, onClose }) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateMutation = useUpdateUtilityService();
  const isPending = updateMutation.isPending;
  const form = useForm<
    CreateUtilityServiceFormValues,
    unknown,
    UpdateUtilityServiceFormValues
  >({
    resolver: zodResolver(updateUtilityServiceSchema),
    defaultValues: buildDefaultValues(service),
    mode: "all",
  });
  const { dirtyFields } = form.formState;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: UpdateUtilityServiceFormValues) => {
    setGeneralError(null);
    setWarning(null);

    const payload = buildUpdateUtilityServicePayload(values, dirtyFields);
    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateMutation.mutate(
      { id: service.id, payload },
      {
        onSuccess: () => {
          toast.success("Service updated successfully");
          onClose();
        },
        onError: (error: ApiError) => {
          if (payload.name !== undefined && isDuplicateNameError(error)) {
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
          Edit utility service
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Changes to the default price apply to every lease that doesn&apos;t
          have its own price.
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

              {warning && <p className="text-warning-500 text-sm">{warning}</p>}

              <UtilityServiceFormFields isEditing />
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
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </Modal>
  );
};
