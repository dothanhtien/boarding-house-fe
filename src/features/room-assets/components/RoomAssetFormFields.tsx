"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import DatePicker from "@/components/form/date-picker";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import type { UpdateRoomAssetFormValues } from "@/features/room-assets/schemas";

export const RoomAssetFormFields: React.FC = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateRoomAssetFormValues>();

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
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
        <div>
          <Label htmlFor="quantity">
            Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            error={!!errors.quantity}
            hint={errors.quantity?.message}
            {...register("quantity")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="purchaseDate">Purchase date</Label>
          <Controller
            name="purchaseDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="purchaseDate"
                placeholder="Select a date"
                clearable
                value={field.value}
                onChange={(_, dateStr) => field.onChange(dateStr)}
                onBlur={field.onBlur}
                error={!!errors.purchaseDate}
                hint={errors.purchaseDate?.message}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="purchaseUnitPrice">Purchase unit price</Label>
          <Input
            id="purchaseUnitPrice"
            type="number"
            step={0.01}
            error={!!errors.purchaseUnitPrice}
            hint={errors.purchaseUnitPrice?.message}
            {...register("purchaseUnitPrice")}
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
              id="note"
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
