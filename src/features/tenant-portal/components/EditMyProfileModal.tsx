"use client";

import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DatePicker from "@/components/form/DatePicker";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  GENDER_OPTIONS,
  IDENTITY_TYPE_OPTIONS,
} from "@/features/tenant-profiles/constants";
import { useUpdateMyTenantProfile } from "@/features/tenant-profiles/mutations";
import {
  TENANT_PROFILE_FORM_FIELDS,
  type TenantProfileFormValues,
  isTenantProfilePayloadEmpty,
  tenantProfileSchema,
  toTenantProfileFormValues,
  toTenantProfilePayload,
} from "@/features/tenant-profiles/schemas";
import type { TenantProfile } from "@/features/tenant-profiles/types";
import { applyApiFormErrors } from "@/utils/formErrors";

interface EditMyProfileModalProps {
  profile: TenantProfile | null;
  onClose: () => void;
}

export const EditMyProfileModal: React.FC<EditMyProfileModalProps> = ({
  profile,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const updateProfile = useUpdateMyTenantProfile();
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<TenantProfileFormValues>({
    resolver: zodResolver(tenantProfileSchema),
    defaultValues: toTenantProfileFormValues(profile),
    mode: "all",
  });

  const identityNumber = useWatch({ control, name: "identityNumber" });
  const hasIdentityNumber = !!identityNumber?.trim();

  const handleClose = () => {
    if (updateProfile.isPending) return;
    onClose();
  };

  const onSubmit = (values: TenantProfileFormValues) => {
    setGeneralError(null);
    const payload = toTenantProfilePayload(values);

    if (!profile && isTenantProfilePayloadEmpty(payload)) {
      setGeneralError("Fill in at least one field.");
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile saved");
        onClose();
      },
      onError: (error) =>
        applyApiFormErrors(
          error,
          [...TENANT_PROFILE_FORM_FIELDS],
          setError,
          setGeneralError,
        ),
    });
  };

  const renderDate = (
    name: "identityIssuedDate" | "identityExpiryDate" | "dateOfBirth",
    id: string,
    disabled = false,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DatePicker
          id={id}
          placeholder="Select a date"
          value={field.value}
          clearable
          disabled={disabled}
          onChange={(_, dateStr) => field.onChange(dateStr)}
          onBlur={field.onBlur}
          error={!!errors[name]}
          hint={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[720px]"
      closeOnBackdropClick={false}
      labelledBy="edit-my-profile-title"
    >
      <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4
          id="edit-my-profile-title"
          className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90"
        >
          {profile ? "Edit personal information" : "Add personal information"}
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Your landlord uses this for your residence registration.
        </p>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-1">
            {generalError && (
              <p className="text-error-500 text-sm" role="alert">
                {generalError}
              </p>
            )}

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Identity document
              </legend>
              <div>
                <Label htmlFor="identityType">Type</Label>
                <Controller
                  control={control}
                  name="identityType"
                  render={({ field }) => (
                    <Select
                      id="identityType"
                      options={IDENTITY_TYPE_OPTIONS}
                      placeholder="None"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.identityType}
                    />
                  )}
                />
                {errors.identityType && (
                  <p className="text-error-500 mt-1.5 text-xs">
                    {errors.identityType.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="identityNumber">Number</Label>
                <Input
                  id="identityNumber"
                  error={!!errors.identityNumber}
                  hint={errors.identityNumber?.message}
                  {...register("identityNumber", {
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.value.trim()) return;
                      setValue("identityIssuedDate", "");
                      setValue("identityExpiryDate", "");
                      setValue("identityIssuedPlace", "");
                      clearErrors([
                        "identityIssuedDate",
                        "identityExpiryDate",
                        "identityIssuedPlace",
                      ]);
                    },
                  })}
                />
              </div>
              <div>
                <Label htmlFor="identityIssuedDate">Issued date</Label>
                {renderDate(
                  "identityIssuedDate",
                  "identityIssuedDate",
                  !hasIdentityNumber,
                )}
              </div>
              <div>
                <Label htmlFor="identityExpiryDate">Expiry date</Label>
                {renderDate(
                  "identityExpiryDate",
                  "identityExpiryDate",
                  !hasIdentityNumber,
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="identityIssuedPlace">Issued place</Label>
                <Input
                  id="identityIssuedPlace"
                  disabled={!hasIdentityNumber}
                  error={!!errors.identityIssuedPlace}
                  hint={errors.identityIssuedPlace?.message}
                  {...register("identityIssuedPlace")}
                />
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Personal
              </legend>
              <div>
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                {renderDate("dateOfBirth", "dateOfBirth")}
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      id="gender"
                      options={GENDER_OPTIONS}
                      placeholder="Not specified"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.gender}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="permanentAddress">Permanent address</Label>
                <Input
                  id="permanentAddress"
                  error={!!errors.permanentAddress}
                  hint={errors.permanentAddress?.message}
                  {...register("permanentAddress")}
                />
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Emergency contact
              </legend>
              <div>
                <Label htmlFor="emergencyContactName">Name</Label>
                <Input
                  id="emergencyContactName"
                  error={!!errors.emergencyContactName}
                  hint={errors.emergencyContactName?.message}
                  {...register("emergencyContactName")}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  error={!!errors.emergencyContactPhone}
                  hint={errors.emergencyContactPhone?.message}
                  {...register("emergencyContactPhone")}
                />
              </div>
            </fieldset>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={updateProfile.isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
