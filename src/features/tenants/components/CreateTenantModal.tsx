"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useCreateTenant } from "@/features/tenants/mutations";
import {
  createTenantSchema,
  type CreateTenantFormValues,
} from "@/features/tenants/schemas";
import type { Tenant } from "@/features/tenants/types";
import { normalizeEmail } from "@/utils/email";
import { normalizePhone } from "@/utils/phone";

interface CreateTenantModalProps {
  initialPhone?: string;
  initialEmail?: string;
  onClose: () => void;
  onCreated: (tenant: Tenant) => void;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  initialPhone = "",
  initialEmail = "",
  onClose,
  onCreated,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createTenantMutation = useCreateTenant();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateTenantFormValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      fullName: "",
      phone: initialPhone,
      email: initialEmail,
      password: "",
      passwordConfirmation: "",
    },
    mode: "all",
  });

  const handleClose = () => {
    if (createTenantMutation.isPending) return;
    onClose();
  };

  const onSubmit = (values: CreateTenantFormValues) => {
    setGeneralError(null);

    createTenantMutation.mutate(
      {
        fullName: values.fullName.trim(),
        phone: normalizePhone(values.phone),
        email: values.email.trim() ? normalizeEmail(values.email) : null,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      },
      {
        onSuccess: (tenant) => {
          toast.success("Tenant account created");
          onCreated(tenant);
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            ["fullName", "phone", "email", "password", "passwordConfirmation"],
            setError,
            setGeneralError,
          );
        },
      },
    );
  };

  return createPortal(
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[500px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative w-full max-w-[500px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          New tenant
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Create an account for a tenant who isn&apos;t in the system yet. Share
          the initial password with them so they can sign in with their phone
          number.
        </p>

        <Form
          onSubmit={(event) => {
            event.stopPropagation();
            handleSubmit(onSubmit)(event);
          }}
          className="flex flex-col gap-5"
        >
          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          <div>
            <Label htmlFor="tenantFullName">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenantFullName"
              type="text"
              error={!!errors.fullName}
              hint={errors.fullName?.message}
              {...register("fullName")}
            />
          </div>

          <div>
            <Label htmlFor="tenantPhone">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenantPhone"
              type="tel"
              error={!!errors.phone}
              hint={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <div>
            <Label htmlFor="tenantEmail">Email</Label>
            <Input
              id="tenantEmail"
              type="email"
              error={!!errors.email}
              hint={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="tenantPassword">
              Initial password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenantPassword"
              type="password"
              error={!!errors.password}
              hint={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div>
            <Label htmlFor="tenantPasswordConfirmation">
              Confirm password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenantPasswordConfirmation"
              type="password"
              error={!!errors.passwordConfirmation}
              hint={errors.passwordConfirmation?.message}
              {...register("passwordConfirmation")}
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={createTenantMutation.isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={createTenantMutation.isPending}>
              {createTenantMutation.isPending
                ? "Creating..."
                : "Create and add"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>,
    document.body,
  );
};
