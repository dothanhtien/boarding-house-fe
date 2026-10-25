"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import DatePicker from "@/components/form/date-picker";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import type { LeaseTermsFormValues } from "@/features/leases/schemas";

interface LeaseTermsFieldsProps {
  isLeaseCodeOptional?: boolean;
  monthlyRentHint?: string;
  depositAmountHint?: string;
}

export const LeaseTermsFields: React.FC<LeaseTermsFieldsProps> = ({
  isLeaseCodeOptional = false,
  monthlyRentHint,
  depositAmountHint,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<LeaseTermsFormValues>();

  const isPriceOptional = monthlyRentHint !== undefined;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="leaseCode">
            Lease code{" "}
            {!isLeaseCodeOptional && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="leaseCode"
            type="text"
            placeholder={isLeaseCodeOptional ? "Auto-generated" : undefined}
            error={!!errors.leaseCode}
            hint={
              errors.leaseCode?.message ??
              (isLeaseCodeOptional
                ? "Leave blank to generate one (HD-…)."
                : undefined)
            }
            {...register("leaseCode")}
          />
        </div>
        <div>
          <Label htmlFor="billingDay">Billing day</Label>
          <Input
            id="billingDay"
            type="number"
            min={1}
            max={28}
            placeholder="Day of start date"
            error={!!errors.billingDay}
            hint={
              errors.billingDay?.message ??
              "Day of month (1–28) rent is billed. Blank = the start date's day."
            }
            {...register("billingDay")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">
            Start date <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="startDate"
                placeholder="Select a date"
                value={field.value}
                onChange={(_, dateStr) => field.onChange(dateStr)}
                onBlur={field.onBlur}
                error={!!errors.startDate}
                hint={errors.startDate?.message}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End date</Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="endDate"
                placeholder="Open-ended"
                clearable
                value={field.value}
                onChange={(_, dateStr) => field.onChange(dateStr)}
                onBlur={field.onBlur}
                error={!!errors.endDate}
                hint={
                  errors.endDate?.message ??
                  "Leave blank for an open-ended lease."
                }
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="monthlyRent">
            Monthly rent{" "}
            {!isPriceOptional && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="monthlyRent"
            type="number"
            step={0.01}
            error={!!errors.monthlyRent}
            hint={errors.monthlyRent?.message ?? monthlyRentHint}
            {...register("monthlyRent")}
          />
        </div>
        <div>
          <Label htmlFor="depositAmount">
            Deposit amount{" "}
            {!isPriceOptional && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="depositAmount"
            type="number"
            step={0.01}
            error={!!errors.depositAmount}
            hint={errors.depositAmount?.message ?? depositAmountHint}
            {...register("depositAmount")}
          />
        </div>
      </div>
    </>
  );
};
