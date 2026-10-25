"use client";

import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Label from "@/components/form/Label";
import { SearchableSelect } from "@/components/form/SearchableSelect";
import { Select } from "@/components/form/Select";
import type { CreateLeaseFormValues } from "@/features/leases/schemas";
import { usePropertyLookup } from "@/features/properties/queries";
import { ROOM_STATUS_LABELS } from "@/features/rooms/constants";
import { useRooms } from "@/features/rooms/queries";

export const LeaseRoomFields: React.FC = () => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateLeaseFormValues>();
  const [roomSearch, setRoomSearch] = useState("");
  const propertyId = watch("propertyId");

  const { data: properties = [], isLoading: isLoadingProperties } =
    usePropertyLookup();
  const { data: roomsData, isLoading: isLoadingRooms } = useRooms(
    {
      propertyId,
      search: roomSearch || undefined,
      pageSize: 20,
      sortBy: "roomNumber",
      sortOrder: "asc",
    },
    { enabled: !!propertyId },
  );

  const propertyOptions = properties.map((property) => ({
    value: property.id,
    label: property.name,
  }));
  const roomOptions = (roomsData?.items ?? []).map((room) => ({
    value: room.id,
    label: `Room ${room.roomNumber} · ${ROOM_STATUS_LABELS[room.roomStatus]}`,
  }));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="propertyId">
          Property <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="propertyId"
          control={control}
          render={({ field }) => (
            <Select
              id="propertyId"
              options={propertyOptions}
              placeholder={
                isLoadingProperties
                  ? "Loading properties..."
                  : "Select a property"
              }
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setValue("roomId", "", { shouldValidate: false });
                setValue("previousLeaseId", "");
              }}
            />
          )}
        />
      </div>
      <div>
        <Label htmlFor="roomId">
          Room <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="roomId"
          control={control}
          render={({ field }) =>
            propertyId ? (
              <SearchableSelect
                key={propertyId}
                id="roomId"
                options={roomOptions}
                value={field.value}
                placeholder={
                  isLoadingRooms ? "Loading rooms..." : "Select a room"
                }
                searchPlaceholder="Search by room number..."
                emptyMessage="No rooms found."
                isLoading={isLoadingRooms}
                onSearchChange={setRoomSearch}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("previousLeaseId", "");
                }}
                error={!!errors.roomId}
              />
            ) : (
              <Select
                id="roomId"
                options={[]}
                placeholder="Select a property first"
                value=""
                error={!!errors.roomId}
                onChange={() => {}}
              />
            )
          }
        />
        {errors.roomId && (
          <p className="text-error-500 mt-1.5 text-sm">
            {errors.roomId.message}
          </p>
        )}
      </div>
    </div>
  );
};
