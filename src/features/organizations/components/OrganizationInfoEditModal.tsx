"use client";

import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUpdateOrganization } from "../mutations";
import {
  UpdateOrganizationFormValues,
  updateOrganizationSchema,
} from "../schemas";
import { Organization, UpdateOrganizationPayload } from "../types";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { OwnerSelectField } from "@/features/organizations/components/OwnerSelectField";
import Switch from "@/components/form/switch/Switch";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";

const OWNER_ROLE_SLUG = "organization_admin";

const getOwner = (organization: Organization) => {
  return (organization.members ?? []).find(
    (member) => member.roleSlug === OWNER_ROLE_SLUG,
  );
};

const getOwnerId = (organization: Organization): string => {
  return getOwner(organization)?.userId ?? "";
};

const getOwnerLabel = (organization: Organization): string | undefined => {
  const owner = getOwner(organization);
  return owner ? `${owner.userFullName} (${owner.userEmail})` : undefined;
};

const buildDefaultValues = (
  organization: Organization,
): UpdateOrganizationFormValues => {
  return {
    name: organization.name,
    ownerId: getOwnerId(organization),
    keepPreviousOwnerAsStaff: true,
    taxCode: organization.taxCode ?? "",
    phone: organization.phone ?? "",
    email: organization.email ?? "",
    province: organization.province ?? "",
    district: organization.district ?? "",
    ward: organization.ward ?? "",
    address: organization.address ?? "",
    isActive: organization.isActive,
  };
};

interface OrganizationInfoEditModalProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationInfoEditModal: React.FC<
  OrganizationInfoEditModalProps
> = ({ organization, isOpen, onClose }) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateOrganizationMutation = useUpdateOrganization();

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: buildDefaultValues(organization),
    mode: "all",
  });

  const currentOwnerId = getOwnerId(organization);
  const selectedOwnerId = watch("ownerId");
  const isOwnerChanged =
    !!selectedOwnerId && selectedOwnerId !== currentOwnerId;

  useEffect(() => {
    if (!isOwnerChanged) {
      setValue("keepPreviousOwnerAsStaff", true);
    }
  }, [isOwnerChanged, setValue]);

  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      reset(buildDefaultValues(organization));
    }
    wasOpen.current = isOpen;
  }, [isOpen, organization, reset]);

  function resetAndClose() {
    setGeneralError(null);
    setWarning(null);
    updateOrganizationMutation.reset();
    onClose();
  }

  function handleClose() {
    if (updateOrganizationMutation.isPending) return;
    resetAndClose();
  }

  function onSubmit(values: UpdateOrganizationFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdateOrganizationPayload = {};
    if (dirtyFields.name) payload.name = values.name.trim();
    if (dirtyFields.ownerId) {
      payload.ownerId = values.ownerId;
      payload.keepPreviousOwnerAsStaff = values.keepPreviousOwnerAsStaff;
    }
    if (dirtyFields.taxCode) payload.taxCode = values.taxCode.trim() || null;
    if (dirtyFields.phone) payload.phone = values.phone.trim() || null;
    if (dirtyFields.email) payload.email = values.email.trim() || null;
    if (dirtyFields.province) payload.province = values.province.trim() || null;
    if (dirtyFields.district) payload.district = values.district.trim() || null;
    if (dirtyFields.ward) payload.ward = values.ward.trim() || null;
    if (dirtyFields.address) payload.address = values.address.trim() || null;
    if (dirtyFields.isActive) payload.isActive = values.isActive;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateOrganizationMutation.mutate(
      { id: organization.id, payload },
      {
        onSuccess: () => {
          toast.success("Organization updated successfully");
          resetAndClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            [
              "name",
              "ownerId",
              "keepPreviousOwnerAsStaff",
              "taxCode",
              "phone",
              "email",
              "province",
              "district",
              "ward",
              "address",
              "isActive",
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
      <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit organization
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Update the organization&apos;s basic information.
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
              <OwnerSelectField
                control={control}
                name="ownerId"
                error={errors.ownerId?.message}
                valueLabel={getOwnerLabel(organization)}
              />
              {isOwnerChanged && (
                <div className="mt-3">
                  <Controller
                    name="keepPreviousOwnerAsStaff"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Keep the previous owner as a staff member of this organization"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.keepPreviousOwnerAsStaff && (
                    <p className="text-error-500 mt-1.5 text-sm">
                      {errors.keepPreviousOwnerAsStaff.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label htmlFor="taxCode">Tax code</Label>
                <Input
                  id="taxCode"
                  type="text"
                  error={!!errors.taxCode}
                  hint={errors.taxCode?.message}
                  {...register("taxCode")}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="text"
                  error={!!errors.phone}
                  hint={errors.phone?.message}
                  {...register("phone")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                error={!!errors.email}
                hint={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
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
              disabled={updateOrganizationMutation.isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={updateOrganizationMutation.isPending}>
              {updateOrganizationMutation.isPending
                ? "Saving..."
                : "Save changes"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
