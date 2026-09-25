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
import { useCreateRoom } from "@/features/rooms/mutations";
import {
  createRoomSchema,
  type CreateRoomFormValues,
} from "@/features/rooms/schemas";
import { ChevronLeftIcon } from "@/icons";
import { RoomFormFields } from "./RoomFormFields";
import { RoomAmenitiesFields } from "./RoomAmenitiesFields";

interface CreateRoomViewProps {
  propertyId: string;
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
  amenities: [],
};

const toNullableNumber = (value: string) =>
  value === "" ? null : Number(value);

export function CreateRoomView({ propertyId }: CreateRoomViewProps) {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { data: property, error: propertyError } = useProperty(propertyId);
  const createRoomMutation = useCreateRoom();
  const isSubmitting =
    createRoomMutation.isPending || createRoomMutation.isSuccess;
  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "all",
  });

  const roomsPath = ROUTES.propertyRooms(propertyId);

  function onSubmit(values: CreateRoomFormValues) {
    if (isSubmitting) return;
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
        amenities: values.amenities.map((amenity) => ({
          name: amenity.name.trim(),
          quantity: toNullableNumber(amenity.quantity),
          icon: amenity.icon || null,
        })),
      },
      {
        onSuccess: (room) => {
          toast.success("Room created successfully");
          router.push(ROUTES.roomDetail(propertyId, room.id));
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
    <div>
      <PageBreadcrumb pageTitle="Add room" />

      <Link
        href={roomsPath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to {property ? property.name : "rooms"}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {propertyError && (
          <p className="text-error-500 mb-5 text-sm">{propertyError.message}</p>
        )}

        <FormProvider {...form}>
          <Form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Room information
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fill in the room&apos;s information to add it to this
                  property.
                </p>
              </div>

              {generalError && (
                <p className="text-error-500 text-sm">{generalError}</p>
              )}

              <RoomFormFields />
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
              <RoomAmenitiesFields />
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push(roomsPath)}
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting || !property}>
                {isSubmitting ? "Creating..." : "Create room"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}
