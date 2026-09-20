"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { OwnerSelectField } from "@/features/organizations/components/OwnerSelectField";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useCreateOrganization } from "@/features/organizations/mutations";
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from "@/features/organizations/schemas";

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES: CreateOrganizationFormValues = {
  name: "",
  ownerId: "",
  taxCode: "",
  phone: "",
  email: "",
  province: "",
  district: "",
  ward: "",
  address: "",
};

export const CreateOrganizationModal: React.FC<
  CreateOrganizationModalProps
> = ({ isOpen, onClose }) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createOrganizationMutation = useCreateOrganization();
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "all",
  });

  function handleClose() {
    if (createOrganizationMutation.isPending) return;

    reset(DEFAULT_VALUES);
    setGeneralError(null);
    createOrganizationMutation.reset();
    onClose();
  }

  function onSubmit(values: CreateOrganizationFormValues) {
    setGeneralError(null);

    createOrganizationMutation.mutate(
      {
        name: values.name.trim(),
        ownerId: values.ownerId,
        taxCode: values.taxCode.trim() || null,
        phone: values.phone.trim() || null,
        email: values.email.trim() || null,
        province: values.province.trim() || null,
        district: values.district.trim() || null,
        ward: values.ward.trim() || null,
        address: values.address.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Organization created successfully");
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(
              DEFAULT_VALUES,
            ) as (keyof CreateOrganizationFormValues)[],
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
          Add organization
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Fill in the organization&apos;s information to add it to the system.
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

            <OwnerSelectField
              control={control}
              name="ownerId"
              error={errors.ownerId?.message}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={createOrganizationMutation.isPending}>
              {createOrganizationMutation.isPending
                ? "Creating..."
                : "Create organization"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
