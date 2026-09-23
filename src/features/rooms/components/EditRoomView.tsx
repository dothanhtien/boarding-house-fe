"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useProperty } from "@/features/properties/queries";
import { useUpdateRoom } from "@/features/rooms/mutations";
import { useRoom } from "@/features/rooms/queries";
import {
  updateRoomSchema,
  type RoomAmenityFormValue,
  type UpdateRoomFormValues,
} from "@/features/rooms/schemas";
import type {
  Room,
  RoomAmenity,
  UpdateRoomAmenityPayload,
  UpdateRoomPayload,
} from "@/features/rooms/types";
import { ChevronLeftIcon } from "@/icons";
import { RoomFormFields } from "./RoomFormFields";
import { RoomAmenitiesFields } from "./RoomAmenitiesFields";

interface EditRoomViewProps {
  propertyId: string;
  roomId: string;
}

interface EditRoomFormProps {
  room: Room;
  onDone: () => void;
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
  amenities: room.amenities.map((amenity) => ({
    amenityId: amenity.id,
    name: amenity.name,
    quantity: amenity.quantity?.toString() ?? "",
    icon: amenity.icon ?? "",
  })),
});

const toNullableNumber = (value: string) =>
  value === "" ? null : Number(value);

// The backend merges amenities by id, so send only what changed: new rows,
// edited fields of existing rows, and removed rows flagged `isDeleted`.
function buildAmenityChanges(
  original: RoomAmenity[],
  values: RoomAmenityFormValue[],
): UpdateRoomAmenityPayload[] {
  const changes: UpdateRoomAmenityPayload[] = [];
  const keptIds = new Set<string>();

  for (const value of values) {
    const name = value.name.trim();
    const quantity = toNullableNumber(value.quantity);
    const icon = value.icon || null;
    const existing = value.amenityId
      ? original.find((amenity) => amenity.id === value.amenityId)
      : undefined;

    if (!existing) {
      changes.push({ name, quantity, icon });
      continue;
    }

    keptIds.add(existing.id);
    const change: UpdateRoomAmenityPayload = { id: existing.id };
    if (name !== existing.name) change.name = name;
    if (quantity !== existing.quantity) change.quantity = quantity;
    if (icon !== existing.icon) change.icon = icon;
    if (Object.keys(change).length > 1) changes.push(change);
  }

  for (const amenity of original) {
    if (!keptIds.has(amenity.id)) {
      changes.push({ id: amenity.id, isDeleted: true });
    }
  }

  return changes;
}

function EditRoomForm({ room, onDone }: EditRoomFormProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateRoomMutation = useUpdateRoom();
  const isSubmitting =
    updateRoomMutation.isPending || updateRoomMutation.isSuccess;
  const form = useForm<UpdateRoomFormValues>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: buildDefaultValues(room),
    mode: "all",
  });
  const {
    formState: { dirtyFields },
  } = form;

  function onSubmit(values: UpdateRoomFormValues) {
    if (isSubmitting) return;
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

    const amenityChanges = buildAmenityChanges(
      room.amenities,
      values.amenities,
    );
    if (amenityChanges.length > 0) payload.amenities = amenityChanges;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateRoomMutation.mutate(
      { id: room.id, payload },
      {
        onSuccess: () => {
          toast.success("Room updated successfully");
          onDone();
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
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Room information
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update the room&apos;s information.
            </p>
          </div>

          {generalError && (
            <p className="text-error-500 text-sm">{generalError}</p>
          )}

          {warning && <p className="text-warning-500 text-sm">{warning}</p>}

          <RoomFormFields showStatus />
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
          <RoomAmenitiesFields />
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onDone}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}

export function EditRoomView({ propertyId, roomId }: EditRoomViewProps) {
  const router = useRouter();
  const { data: property } = useProperty(propertyId);
  const { data: room, isLoading, error } = useRoom(roomId);

  const roomPath = ROUTES.roomDetail(propertyId, roomId);
  const isRoomInProperty = room?.propertyId === propertyId;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit room" />

      <Link
        href={roomPath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to room {room && isRoomInProperty ? room.roomNumber : ""}
        {property && ` · ${property.name}`}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        {room && !isRoomInProperty && (
          <p className="text-error-500 text-sm">
            This room does not belong to the selected property.
          </p>
        )}

        {room && isRoomInProperty && (
          <EditRoomForm room={room} onDone={() => router.push(roomPath)} />
        )}
      </div>
    </div>
  );
}
