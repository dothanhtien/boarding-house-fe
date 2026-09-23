"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useCreateRoom } from "@/features/rooms/mutations";
import {
  createRoomSchema,
  type CreateRoomFormValues,
} from "@/features/rooms/schemas";
import { RoomFormFields } from "./RoomFormFields";

interface CreateRoomModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES: CreateRoomFormValues = {
  roomNumber: "",
  roomCategory: "standard",
  floorNumber: "",
  area: "",
  capacity: "",
  monthlyRent: "",
  depositAmount: "",
  note: "",
};

const toNullableNumber = (value: string) =>
  value === "" ? null : Number(value);

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  propertyId,
  isOpen,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createRoomMutation = useCreateRoom();
  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "all",
  });

  function handleClose() {
    if (createRoomMutation.isPending) return;

    form.reset(DEFAULT_VALUES);
    setGeneralError(null);
    createRoomMutation.reset();
    onClose();
  }

  function onSubmit(values: CreateRoomFormValues) {
    setGeneralError(null);

    createRoomMutation.mutate(
      {
        propertyId,
        roomNumber: values.roomNumber.trim(),
        roomCategory: values.roomCategory,
        floorNumber: toNullableNumber(values.floorNumber),
        area: toNullableNumber(values.area),
        capacity: toNullableNumber(values.capacity),
        monthlyRent: toNullableNumber(values.monthlyRent),
        depositAmount: toNullableNumber(values.depositAmount),
        note: values.note.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Room created successfully");
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(DEFAULT_VALUES) as (keyof CreateRoomFormValues)[],
            form.setError,
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
          Add room
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Fill in the room&apos;s information to add it to this property.
        </p>

        <FormProvider {...form}>
          <Form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
              {generalError && (
                <p className="text-error-500 text-sm">{generalError}</p>
              )}

              <RoomFormFields />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending ? "Creating..." : "Create room"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </Modal>
  );
};
