"use client";

import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
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
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { PencilIcon } from "@/icons";
import { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";

interface OrganizationInfoCardProps {
  organization: Organization;
}

function buildDefaultValues(
  organization: Organization,
): UpdateOrganizationFormValues {
  return {
    name: organization.name,
    taxCode: organization.taxCode ?? "",
    phone: organization.phone ?? "",
    email: organization.email ?? "",
    province: organization.province ?? "",
    district: organization.district ?? "",
    ward: organization.ward ?? "",
    address: organization.address ?? "",
    isActive: organization.isActive,
  };
}

export function OrganizationInfoCard({
  organization,
}: OrganizationInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3 lg:mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Organization details
            </h4>
            <Badge
              size="sm"
              color={organization.isActive ? "success" : "error"}
            >
              {organization.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr] lg:gap-7 2xl:gap-x-32">
            <InfoItem label="Name" value={organization.name} />
            <InfoItem label="Tax code" value={organization.taxCode} />
            <InfoItem label="Phone" value={organization.phone} />
            <InfoItem label="Email" value={organization.email} />
            <InfoItem label="Province" value={organization.province} />
            <InfoItem label="District" value={organization.district} />
            <InfoItem label="Ward" value={organization.ward} />
            <InfoItem label="Address" value={organization.address} />
          </div>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </button>
      </div>

      <OrganizationInfoEditModal
        organization={organization}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </div>
  );
}

interface OrganizationInfoEditModalProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

function OrganizationInfoEditModal({
  organization,
  isOpen,
  onClose,
}: OrganizationInfoEditModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateOrganizationMutation = useUpdateOrganization();

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: buildDefaultValues(organization),
    mode: "all",
  });

  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      reset(buildDefaultValues(organization));
    }
    wasOpen.current = isOpen;
  }, [isOpen, organization, reset]);

  function handleClose() {
    setGeneralError(null);
    setWarning(null);
    updateOrganizationMutation.reset();
    onClose();
  }

  function onSubmit(values: UpdateOrganizationFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdateOrganizationPayload = {};
    if (dirtyFields.name) payload.name = values.name.trim();
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
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            [
              "name",
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
      <div className="no-scrollbar relative max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit organization
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Update the organization&apos;s basic information.
        </p>

        <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
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
}
