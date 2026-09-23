"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { Select } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useCreateProperty } from "@/features/properties/mutations";
import {
  createPropertySchema,
  type CreatePropertyFormValues,
} from "@/features/properties/schemas";
import { LATE_FEE_TYPE_OPTIONS } from "@/features/organizations/components/OrganizationSettingsCard";

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES: CreatePropertyFormValues = {
  name: "",
  description: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  defaultBillingDay: "",
  lateFeeType: "",
  lateFeeValue: "",
  lateFeeGraceDays: "",
};

export const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createPropertyMutation = useCreateProperty();
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePropertyFormValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: DEFAULT_VALUES,
    mode: "all",
  });

  function handleClose() {
    if (createPropertyMutation.isPending) return;

    reset(DEFAULT_VALUES);
    setGeneralError(null);
    createPropertyMutation.reset();
    onClose();
  }

  function onSubmit(values: CreatePropertyFormValues) {
    setGeneralError(null);

    createPropertyMutation.mutate(
      {
        name: values.name.trim(),
        description: values.description.trim() || null,
        province: values.province.trim() || null,
        district: values.district.trim() || null,
        ward: values.ward.trim() || null,
        address: values.address.trim() || null,
        defaultBillingDay:
          values.defaultBillingDay === ""
            ? null
            : Number(values.defaultBillingDay),
        lateFeeType: values.lateFeeType === "" ? null : values.lateFeeType,
        lateFeeValue:
          values.lateFeeValue === "" ? null : Number(values.lateFeeValue),
        lateFeeGraceDays:
          values.lateFeeGraceDays === ""
            ? null
            : Number(values.lateFeeGraceDays),
      },
      {
        onSuccess: () => {
          toast.success("Property created successfully");
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(DEFAULT_VALUES) as (keyof CreatePropertyFormValues)[],
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
          Add property
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Fill in the property&apos;s information to add it to the system.
        </p>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
            {generalError && (
              <p className="text-error-500 text-sm">{generalError}</p>
            )}

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
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={createPropertyMutation.isPending}>
              {createPropertyMutation.isPending
                ? "Creating..."
                : "Create property"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
