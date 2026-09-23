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
import { useUpdateRoom } from "@/features/rooms/mutations";
import {
  updateRoomSchema,
  type UpdateRoomFormValues,
} from "@/features/rooms/schemas";
import type { Room, UpdateRoomPayload } from "@/features/rooms/types";
import { RoomFormFields } from "./RoomFormFields";

interface EditRoomModalProps {
  room: Room;
  onClose: () => void;
}

const buildDefaultValues = (room: Room): UpdateRoomFormValues => ({
  roomNumber: room.roomNumber,
  roomCategory: room.roomCategory,
  roomStatus: room.roomStatus,
  floorNumber: room.floorNumber?.toString() ?? "",
  area: room.area?.toString() ?? "",
  capacity: room.capacity?.toString() ?? "",
  monthlyRent: room.monthlyRent?.toString() ?? "",
  depositAmount: room.depositAmount?.toString() ?? "",
  note: room.note ?? "",
});

const toNullableNumber = (value: string) =>
  value === "" ? null : Number(value);

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateRoomMutation = useUpdateRoom();
  const form = useForm<UpdateRoomFormValues>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: buildDefaultValues(room),
    mode: "all",
  });
  const {
    formState: { dirtyFields },
  } = form;

  function handleClose() {
    if (updateRoomMutation.isPending) return;
    onClose();
  }

  function onSubmit(values: UpdateRoomFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdateRoomPayload = {};
    if (dirtyFields.roomNumber) payload.roomNumber = values.roomNumber.trim();
    if (dirtyFields.roomCategory) payload.roomCategory = values.roomCategory;
    if (dirtyFields.roomStatus) payload.roomStatus = values.roomStatus;
    if (dirtyFields.floorNumber)
      payload.floorNumber = toNullableNumber(values.floorNumber);
    if (dirtyFields.area) payload.area = toNullableNumber(values.area);
    if (dirtyFields.capacity)
      payload.capacity = toNullableNumber(values.capacity);
    if (dirtyFields.monthlyRent)
      payload.monthlyRent = toNullableNumber(values.monthlyRent);
    if (dirtyFields.depositAmount)
      payload.depositAmount = toNullableNumber(values.depositAmount);
    if (dirtyFields.note) payload.note = values.note.trim() || null;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateRoomMutation.mutate(
      { id: room.id, payload },
      {
        onSuccess: () => {
          toast.success("Room updated successfully");
          onClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(
              buildDefaultValues(room),
            ) as (keyof UpdateRoomFormValues)[],
            form.setError,
            setGeneralError,
          );
        },
      },
    );
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[720px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit room
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Update the room&apos;s information.
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

              {warning && <p className="text-warning-500 text-sm">{warning}</p>}

              <RoomFormFields showStatus />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={updateRoomMutation.isPending}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button disabled={updateRoomMutation.isPending}>
                {updateRoomMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </Modal>
  );
};
