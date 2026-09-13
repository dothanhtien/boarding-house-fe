import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import { CreateUserFormValues, createUserSchema } from "../schemas";
import { useCreateUser } from "../mutations";
import { ApiError } from "@/lib/axios";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES: CreateUserFormValues = {
  email: "",
  fullName: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
};

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createUserMutation = useCreateUser();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
  });

  function handleClose() {
    reset(DEFAULT_VALUES);
    setGeneralError(null);
    createUserMutation.reset();
    onClose();
  }

  function onSubmit(values: CreateUserFormValues) {
    setGeneralError(null);

    createUserMutation.mutate(
      {
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || null,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      },
      {
        onSuccess: handleClose,
        onError: (error: ApiError) => {
          if (error.errors) {
            for (const [field, messages] of Object.entries(error.errors)) {
              setError(field as keyof CreateUserFormValues, {
                message: messages[0],
              });
            }
          } else {
            setGeneralError(error.message);
          }
        },
      },
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="m-4 max-w-[500px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative w-full max-w-[500px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Add user
        </h4>

        <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          <div>
            <Label>
              Full name <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              error={!!errors.fullName}
              hint={errors.fullName?.message}
              {...register("fullName")}
            />
          </div>

          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              error={!!errors.email}
              hint={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              error={!!errors.phone}
              hint={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              error={!!errors.password}
              hint={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div>
            <Label>
              Confirm password <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              error={!!errors.passwordConfirmation}
              hint={errors.passwordConfirmation?.message}
              {...register("passwordConfirmation")}
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Create user"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
