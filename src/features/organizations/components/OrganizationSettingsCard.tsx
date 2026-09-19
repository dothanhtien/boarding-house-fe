"use client";

import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { useOrganizationSettings } from "../queries";
import { useUpdateOrganizationSettings } from "../mutations";
import {
  OrganizationSettingsFormValues,
  organizationSettingsSchema,
} from "../schemas";
import {
  OrganizationSettings,
  UpdateOrganizationSettingsPayload,
} from "../types";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Select } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { PencilIcon } from "@/icons";
import { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";

interface OrganizationSettingsCardProps {
  organizationId: string;
}

const LATE_FEE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "percent", label: "Percent" },
  { value: "fixed", label: "Fixed amount" },
];

const LATE_FEE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  LATE_FEE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

function buildDefaultValues(
  settings: OrganizationSettings,
): OrganizationSettingsFormValues {
  return {
    defaultBillingDay: settings.defaultBillingDay?.toString() ?? "",
    lateFeeType: settings.lateFeeType ?? "",
    lateFeeValue: settings.lateFeeValue?.toString() ?? "",
    lateFeeGraceDays: settings.lateFeeGraceDays?.toString() ?? "",
    vatRate: settings.vatRate?.toString() ?? "",
    bankAccountNumber: settings.bankAccountNumber ?? "",
    bankName: settings.bankName ?? "",
    bankAccountName: settings.bankAccountName ?? "",
  };
}

export function OrganizationSettingsCard({
  organizationId,
}: OrganizationSettingsCardProps) {
  const {
    data: settings,
    isLoading,
    error,
  } = useOrganizationSettings(organizationId);
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3 lg:mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Organization settings
            </h4>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          )}

          {error && !isLoading && (
            <p className="text-error-500 text-sm">{error.message}</p>
          )}

          {settings && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr] lg:gap-7 2xl:gap-x-32">
              <InfoItem label="Currency" value={settings.currency} />
              <InfoItem
                label="Default billing day"
                value={settings.defaultBillingDay}
              />
              <InfoItem
                label="Late fee type"
                value={
                  settings.lateFeeType
                    ? LATE_FEE_TYPE_LABELS[settings.lateFeeType]
                    : null
                }
              />
              <InfoItem
                label="Late fee value"
                value={
                  settings.lateFeeValue === null
                    ? null
                    : settings.lateFeeType === "percent"
                      ? `${settings.lateFeeValue}%`
                      : formatCurrency(settings.lateFeeValue, {
                          currency: settings.currency,
                        })
                }
              />
              <InfoItem
                label="Late fee grace days"
                value={settings.lateFeeGraceDays}
              />
              <InfoItem
                label="VAT rate"
                value={
                  settings.vatRate !== null ? `${settings.vatRate}%` : null
                }
              />
              <InfoItem label="Bank name" value={settings.bankName} />
              <InfoItem
                label="Bank account number"
                value={settings.bankAccountNumber}
              />
              <InfoItem
                label="Bank account name"
                value={settings.bankAccountName}
              />
              <InfoItem
                label="Last updated"
                value={formatDate(settings.updatedAt)}
              />
            </div>
          )}
        </div>

        {settings && (
          <button
            type="button"
            onClick={openModal}
            className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {settings && (
        <OrganizationSettingsEditModal
          organizationId={organizationId}
          settings={settings}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

interface OrganizationSettingsEditModalProps {
  organizationId: string;
  settings: OrganizationSettings;
  isOpen: boolean;
  onClose: () => void;
}

function OrganizationSettingsEditModal({
  organizationId,
  settings,
  isOpen,
  onClose,
}: OrganizationSettingsEditModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateSettingsMutation = useUpdateOrganizationSettings();

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<OrganizationSettingsFormValues>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: buildDefaultValues(settings),
    mode: "all",
  });

  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      reset(buildDefaultValues(settings));
    }
    wasOpen.current = isOpen;
  }, [isOpen, settings, reset]);

  function handleClose() {
    setGeneralError(null);
    setWarning(null);
    updateSettingsMutation.reset();
    reset(buildDefaultValues(settings));
    onClose();
  }

  function onSubmit(values: OrganizationSettingsFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdateOrganizationSettingsPayload = {};
    if (dirtyFields.defaultBillingDay) {
      payload.defaultBillingDay =
        values.defaultBillingDay === ""
          ? null
          : Number(values.defaultBillingDay);
    }
    if (dirtyFields.lateFeeType) {
      payload.lateFeeType =
        values.lateFeeType === "" ? null : values.lateFeeType;
    }
    if (dirtyFields.lateFeeValue) {
      payload.lateFeeValue =
        values.lateFeeValue === "" ? null : Number(values.lateFeeValue);
    }
    if (dirtyFields.lateFeeGraceDays) {
      payload.lateFeeGraceDays =
        values.lateFeeGraceDays === "" ? null : Number(values.lateFeeGraceDays);
    }
    if (dirtyFields.vatRate) {
      payload.vatRate = values.vatRate === "" ? null : Number(values.vatRate);
    }
    if (dirtyFields.bankAccountNumber) {
      payload.bankAccountNumber = values.bankAccountNumber.trim() || null;
    }
    if (dirtyFields.bankName) {
      payload.bankName = values.bankName.trim() || null;
    }
    if (dirtyFields.bankAccountName) {
      payload.bankAccountName = values.bankAccountName.trim() || null;
    }

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateSettingsMutation.mutate(
      { id: organizationId, payload },
      {
        onSuccess: () => {
          toast.success("Organization settings updated successfully");
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            [
              "defaultBillingDay",
              "lateFeeType",
              "lateFeeValue",
              "lateFeeGraceDays",
              "vatRate",
              "bankAccountNumber",
              "bankName",
              "bankAccountName",
            ],
            setError,
            setGeneralError,
          );
        },
      },
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="m-4 max-w-[720px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit organization settings
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Billing, late fee, VAT and bank details for this organization.
        </p>

        <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          {warning && <p className="text-warning-500 text-sm">{warning}</p>}

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label htmlFor="defaultBillingDay">Default billing day</Label>
              <Input
                id="defaultBillingDay"
                type="number"
                min={1}
                max={28}
                error={!!errors.defaultBillingDay}
                hint={errors.defaultBillingDay?.message}
                {...register("defaultBillingDay")}
              />
            </div>
            <div>
              <Label htmlFor="vatRate">VAT rate (%)</Label>
              <Input
                id="vatRate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                error={!!errors.vatRate}
                hint={errors.vatRate?.message}
                {...register("vatRate")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
            <div>
              <Label htmlFor="lateFeeType">Late fee type</Label>
              <Controller
                name="lateFeeType"
                control={control}
                render={({ field }) => (
                  <Select
                    options={LATE_FEE_TYPE_OPTIONS}
                    placeholder="No late fee"
                    defaultValue={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value === "") {
                        setValue("lateFeeValue", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="lateFeeValue">Late fee value</Label>
              <Input
                id="lateFeeValue"
                type="number"
                step={0.01}
                error={!!errors.lateFeeValue}
                hint={errors.lateFeeValue?.message}
                {...register("lateFeeValue")}
              />
            </div>
            <div>
              <Label htmlFor="lateFeeGraceDays">Grace days</Label>
              <Input
                id="lateFeeGraceDays"
                type="number"
                min={0}
                error={!!errors.lateFeeGraceDays}
                hint={errors.lateFeeGraceDays?.message}
                {...register("lateFeeGraceDays")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
            <div>
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                type="text"
                error={!!errors.bankName}
                hint={errors.bankName?.message}
                {...register("bankName")}
              />
            </div>
            <div>
              <Label htmlFor="bankAccountNumber">Bank account number</Label>
              <Input
                id="bankAccountNumber"
                type="text"
                error={!!errors.bankAccountNumber}
                hint={errors.bankAccountNumber?.message}
                {...register("bankAccountNumber")}
              />
            </div>
            <div>
              <Label htmlFor="bankAccountName">Bank account name</Label>
              <Input
                id="bankAccountName"
                type="text"
                error={!!errors.bankAccountName}
                hint={errors.bankAccountName?.message}
                {...register("bankAccountName")}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
