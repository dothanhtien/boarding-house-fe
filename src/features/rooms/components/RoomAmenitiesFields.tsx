"use client";

import React from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  MAX_ROOM_AMENITIES,
  type RoomAmenitiesFormValues,
} from "@/features/rooms/schemas";
import { PlusIcon, TrashBinIcon } from "@/icons";
import { AmenityIconPicker } from "./AmenityIconPicker";

export const RoomAmenitiesFields: React.FC = () => {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<RoomAmenitiesFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "amenities",
  });

  const canAddMore = fields.length < MAX_ROOM_AMENITIES;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Amenities
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Features shown in the room listing, e.g. WiFi, air conditioner,
            balcony. Leave quantity blank for features that aren&apos;t counted.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<PlusIcon />}
          disabled={!canAddMore}
          onClick={() => append({ name: "", quantity: "", icon: "" })}
        >
          Add amenity
        </Button>
      </div>

      {errors.amenities?.root?.message && (
        <p className="text-error-500 text-sm">
          {errors.amenities.root.message}
        </p>
      )}

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No amenities added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const fieldErrors = errors.amenities?.[index];

            return (
              <div
                key={field.id}
                className="grid grid-cols-[auto_1fr_5rem_auto] items-start gap-3 sm:grid-cols-[auto_1fr_8rem_auto]"
              >
                <div>
                  <Label htmlFor={`amenities.${index}.icon`}>Icon</Label>
                  <Controller
                    name={`amenities.${index}.icon`}
                    control={control}
                    render={({ field }) => (
                      <AmenityIconPicker
                        id={`amenities.${index}.icon`}
                        value={field.value}
                        onChange={(key, option) => {
                          field.onChange(key);
                          const namePath = `amenities.${index}.name` as const;
                          if (option && !getValues(namePath).trim()) {
                            setValue(namePath, option.label, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor={`amenities.${index}.name`}>
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`amenities.${index}.name`}
                    type="text"
                    placeholder="e.g. WiFi"
                    error={!!fieldErrors?.name}
                    hint={fieldErrors?.name?.message}
                    {...register(`amenities.${index}.name`)}
                  />
                </div>
                <div>
                  <Label htmlFor={`amenities.${index}.quantity`}>
                    Quantity
                  </Label>
                  <Input
                    id={`amenities.${index}.quantity`}
                    type="number"
                    min={1}
                    placeholder="—"
                    error={!!fieldErrors?.quantity}
                    hint={fieldErrors?.quantity?.message}
                    {...register(`amenities.${index}.quantity`)}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove amenity"
                  onClick={() => remove(index)}
                  className="hover:text-error-500 dark:hover:text-error-500 mt-9.5 cursor-pointer text-gray-700 dark:text-gray-400"
                >
                  <TrashBinIcon className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
