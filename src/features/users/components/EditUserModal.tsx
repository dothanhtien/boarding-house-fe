import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUpdateUser } from "../mutations";
import { UpdateUserFormValues, updateUserSchema } from "../schemas";
import { UpdateUserPayload, User } from "../types";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/axios";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? "",
      isActive: user.isActive,
    },
    mode: "all",
  });

  function handleClose() {
    setGeneralError(null);
    setWarning(null);
    updateUserMutation.reset();
    onClose();
  }

  function handleUpdateSuccess() {
    toast.success("User updated successfully");
    handleClose();
  }

  function onSubmit(values: UpdateUserFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdateUserPayload = {};
    if (dirtyFields.email) payload.email = values.email.trim();
    if (dirtyFields.fullName) payload.fullName = values.fullName.trim();
    if (dirtyFields.phone) {
      const trimmedPhone = values.phone.trim();
      payload.phone = trimmedPhone || (user.phone === null ? null : "");
    }
    if (dirtyFields.isActive) payload.isActive = values.isActive;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateUserMutation.mutate(
      { id: user.id, payload },
      {
        onSuccess: handleUpdateSuccess,
        onError: (error: ApiError) => {
          if (error.errors) {
            for (const [field, messages] of Object.entries(error.errors)) {
              setError(field as keyof UpdateUserFormValues, {
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
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[500px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative w-full max-w-[500px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit user
        </h4>

        <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          {warning && <p className="text-warning-500 text-sm">{warning}</p>}

          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              error={!!errors.email}
              hint={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="fullName">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              error={!!errors.fullName}
              hint={errors.fullName?.message}
              {...register("fullName")}
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

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                label="Active"
                defaultChecked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
