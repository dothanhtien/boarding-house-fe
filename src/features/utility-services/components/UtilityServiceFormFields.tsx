"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Select } from "@/components/form/Select";
import {
  UTILITY_TYPE_LABELS,
  UTILITY_TYPE_OPTIONS,
  UtilityBillingMethod,
  type UtilityType,
} from "@/features/utility-services/constants";
import type { CreateUtilityServiceFormValues } from "@/features/utility-services/schemas";
import {
  getDefaultBillingMethod,
  getDefaultUnit,
} from "@/features/utility-services/utils";
import { BillingMethodRadioCards } from "./BillingMethodRadioCards";
import { UtilityTypeIcon } from "./UtilityTypeIcon";

interface UtilityServiceFormFieldsProps {
  isEditing?: boolean;
}

export const UtilityServiceFormFields: React.FC<
  UtilityServiceFormFieldsProps
> = ({ isEditing = false }) => {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext<CreateUtilityServiceFormValues>();
  const billingMethod = useWatch({ control, name: "billingMethod" });

  const prefillUnit = (
    type: UtilityType,
    billingMethod: UtilityBillingMethod,
  ) => {
    if (dirtyFields.unit) return;
    setValue("unit", getDefaultUnit(type, billingMethod), {
      shouldValidate: !!errors.unit,
    });
  };

  const handleTypeChange = (type: UtilityType) => {
    let billingMethod = getValues("billingMethod");
    if (!dirtyFields.billingMethod || billingMethod === "") {
      billingMethod = getDefaultBillingMethod(type);
      setValue("billingMethod", billingMethod, {
        shouldValidate: !!errors.billingMethod,
      });
    }
    prefillUnit(type, billingMethod);
  };

  const handleBillingMethodChange = (billingMethod: UtilityBillingMethod) => {
    const type = getValues("type");
    if (!isEditing && type !== "") prefillUnit(type, billingMethod);
  };

  const type = getValues("type");

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
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
          <Label htmlFor="type">
            Type {!isEditing && <span className="text-red-500">*</span>}
          </Label>
          {isEditing && type !== "" ? (
            <div className="shadow-theme-xs flex h-11 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <UtilityTypeIcon type={type} className="h-4 w-4" />
              {UTILITY_TYPE_LABELS[type]}
            </div>
          ) : (
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  id="type"
                  options={UTILITY_TYPE_OPTIONS}
                  placeholder="Select a type"
                  value={field.value}
                  error={!!errors.type}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value !== "") handleTypeChange(value as UtilityType);
                  }}
                />
              )}
            />
          )}
          {errors.type && (
            <p className="text-error-500 mt-1.5 text-sm">
              {errors.type.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>
          Billing method <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="billingMethod"
          control={control}
          render={({ field }) => (
            <BillingMethodRadioCards
              name={field.name}
              value={field.value}
              error={!!errors.billingMethod}
              onBlur={field.onBlur}
              onChange={(value) => {
                field.onChange(value);
                handleBillingMethodChange(value);
              }}
            />
          )}
        />
        {errors.billingMethod ? (
          <p className="text-error-500 mt-1.5 text-sm">
            {errors.billingMethod.message}
          </p>
        ) : (
          isEditing && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Can&apos;t be changed once a lease uses this service.
            </p>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="unit">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Input
            id="unit"
            type="text"
            placeholder="kWh, m³, month…"
            error={!!errors.unit}
            hint={errors.unit?.message}
            {...register("unit")}
          />
        </div>
        <div>
          <Label htmlFor="defaultUnitPrice">
            Default price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="defaultUnitPrice"
            type="number"
            min={0}
            step={0.01}
            error={!!errors.defaultUnitPrice}
            hint={
              errors.defaultUnitPrice?.message ??
              (billingMethod === UtilityBillingMethod.Fixed
                ? "Price for one unit, e.g. 50.000 VND per parking slot. A lease with 2 slots pays 100.000 VND."
                : "Leases use this price unless they set their own.")
            }
            {...register("defaultUnitPrice")}
          />
        </div>
      </div>
    </>
  );
};
