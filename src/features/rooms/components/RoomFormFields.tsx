"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { Select } from "@/components/form/Select";
import {
  ROOM_CATEGORY_OPTIONS,
  ROOM_STATUS_OPTIONS,
} from "@/features/rooms/constants";
import type { UpdateRoomFormValues } from "@/features/rooms/schemas";

interface RoomFormFieldsProps {
  showStatus?: boolean;
}

export const RoomFormFields: React.FC<RoomFormFieldsProps> = ({
  showStatus = false,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateRoomFormValues>();

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="roomNumber">
            Room number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="roomNumber"
            type="text"
            error={!!errors.roomNumber}
            hint={errors.roomNumber?.message}
            {...register("roomNumber")}
          />
        </div>
        <div>
          <Label htmlFor="floorNumber">Floor</Label>
          <Input
            id="floorNumber"
            type="number"
            min={0}
            error={!!errors.floorNumber}
            hint={errors.floorNumber?.message}
            {...register("floorNumber")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="roomCategory">Category</Label>
          <Controller
            name="roomCategory"
            control={control}
            render={({ field }) => (
              <Select
                options={ROOM_CATEGORY_OPTIONS}
                placeholder="Select a category"
                value={field.value}
                error={!!errors.roomCategory}
                onChange={field.onChange}
              />
            )}
          />
          {errors.roomCategory && (
            <p className="text-error-500 mt-1.5 text-sm">
              {errors.roomCategory.message}
            </p>
          )}
        </div>
        {showStatus && (
          <div>
            <Label htmlFor="roomStatus">Status</Label>
            <Controller
              name="roomStatus"
              control={control}
              render={({ field }) => (
                <Select
                  options={ROOM_STATUS_OPTIONS}
                  placeholder="Select a status"
                  value={field.value}
                  error={!!errors.roomStatus}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.roomStatus && (
              <p className="text-error-500 mt-1.5 text-sm">
                {errors.roomStatus.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="area">Area (m²)</Label>
          <Input
            id="area"
            type="number"
            step={0.01}
            error={!!errors.area}
            hint={errors.area?.message}
            {...register("area")}
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            error={!!errors.capacity}
            hint={errors.capacity?.message}
            {...register("capacity")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="monthlyRent">Monthly rent</Label>
          <Input
            id="monthlyRent"
            type="number"
            step={0.01}
            error={!!errors.monthlyRent}
            hint={errors.monthlyRent?.message}
            {...register("monthlyRent")}
          />
        </div>
        <div>
          <Label htmlFor="depositAmount">Deposit amount</Label>
          <Input
            id="depositAmount"
            type="number"
            step={0.01}
            error={!!errors.depositAmount}
            hint={errors.depositAmount?.message}
            {...register("depositAmount")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <TextArea
              value={field.value}
              onChange={field.onChange}
              error={!!errors.note}
              hint={errors.note?.message}
            />
          )}
        />
      </div>
    </>
  );
};
