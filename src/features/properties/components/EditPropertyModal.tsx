"use client";

import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { Select } from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useUpdateProperty } from "@/features/properties/mutations";
import {
  updatePropertySchema,
  type UpdatePropertyFormValues,
} from "@/features/properties/schemas";
import type {
  Property,
  UpdatePropertyPayload,
} from "@/features/properties/types";
import { LATE_FEE_TYPE_OPTIONS } from "@/features/organizations/components/OrganizationSettingsCard";

interface EditPropertyModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const buildDefaultValues = (property: Property): UpdatePropertyFormValues => ({
  name: property.name,
  description: property.description ?? "",
  province: property.province ?? "",
  district: property.district ?? "",
  ward: property.ward ?? "",
  address: property.address ?? "",
  defaultBillingDay: property.defaultBillingDay?.toString() ?? "",
  lateFeeType: property.lateFeeType ?? "",
  lateFeeValue: property.lateFeeValue?.toString() ?? "",
  lateFeeGraceDays: property.lateFeeGraceDays?.toString() ?? "",
  isActive: property.isActive,
});

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updatePropertyMutation = useUpdateProperty();

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<UpdatePropertyFormValues>({
    resolver: zodResolver(updatePropertySchema),
    defaultValues: buildDefaultValues(property),
    mode: "all",
  });

  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      reset(buildDefaultValues(property));
    }
    wasOpen.current = isOpen;
  }, [isOpen, property, reset]);

  function resetAndClose() {
    setGeneralError(null);
    setWarning(null);
    updatePropertyMutation.reset();
    reset(buildDefaultValues(property));
    onClose();
  }

  function handleClose() {
    if (updatePropertyMutation.isPending) return;
    resetAndClose();
  }

  function onSubmit(values: UpdatePropertyFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdatePropertyPayload = {};
    if (dirtyFields.name) payload.name = values.name.trim();
    if (dirtyFields.description)
      payload.description = values.description.trim() || null;
    if (dirtyFields.province) payload.province = values.province.trim() || null;
    if (dirtyFields.district) payload.district = values.district.trim() || null;
    if (dirtyFields.ward) payload.ward = values.ward.trim() || null;
    if (dirtyFields.address) payload.address = values.address.trim() || null;
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
    if (dirtyFields.isActive) payload.isActive = values.isActive;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updatePropertyMutation.mutate(
      { id: property.id, payload },
      {
        onSuccess: () => {
          toast.success("Property updated successfully");
          resetAndClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(
              buildDefaultValues(property),
            ) as (keyof UpdatePropertyFormValues)[],
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
      <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit property
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Update the property&apos;s information.
        </p>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
            {generalError && (
              <p className="text-error-500 text-sm">{generalError}</p>
            )}

            {warning && <p className="text-warning-500 text-sm">{warning}</p>}

            <div>
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                error={!!errors.name}
                hint={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.description}
                    hint={errors.description?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  type="text"
                  error={!!errors.province}
                  hint={errors.province?.message}
                  {...register("province")}
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  type="text"
                  error={!!errors.district}
                  hint={errors.district?.message}
                  {...register("district")}
                />
              </div>
              <div>
                <Label htmlFor="ward">Ward</Label>
                <Input
                  id="ward"
                  type="text"
                  error={!!errors.ward}
                  hint={errors.ward?.message}
                  {...register("ward")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                error={!!errors.address}
                hint={errors.address?.message}
                {...register("address")}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
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
                <Label htmlFor="lateFeeType">Late fee type</Label>
                <Controller
                  name="lateFeeType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={LATE_FEE_TYPE_OPTIONS}
                      placeholder="No late fee"
                      value={field.value}
                      error={!!errors.lateFeeType}
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
                {errors.lateFeeType && (
                  <p className="text-error-500 mt-1.5 text-sm">
                    {errors.lateFeeType.message}
                  </p>
                )}
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
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

            <div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    label="Active"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.isActive && (
                <p className="text-error-500 mt-1.5 text-sm">
                  {errors.isActive.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={updatePropertyMutation.isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={updatePropertyMutation.isPending}>
              {updatePropertyMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
