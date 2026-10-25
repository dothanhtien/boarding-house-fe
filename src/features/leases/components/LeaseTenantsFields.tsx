"use client";

import React from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";
import DatePicker from "@/components/form/date-picker";
import Checkbox from "@/components/form/input/Checkbox";
import { MAX_LEASE_TENANTS } from "@/features/leases/constants";
import type { LeaseTermsFormValues } from "@/features/leases/schemas";
import { TenantLookupField } from "@/features/tenants/components/TenantLookupField";

interface LeaseTenantsFieldsProps {
  capacity?: number | null;
}

export const LeaseTenantsFields: React.FC<LeaseTenantsFieldsProps> = ({
  capacity,
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LeaseTermsFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tenants",
  });
  const tenants = watch("tenants");

  const maxTenants = Math.min(capacity ?? MAX_LEASE_TENANTS, MAX_LEASE_TENANTS);
  const isFull = fields.length >= maxTenants;

  const setRepresentative = (index: number, checked: boolean) => {
    tenants.forEach((tenant, i) => {
      const next = i === index ? checked : false;
      if (tenant.isRepresentative !== next) {
        setValue(`tenants.${i}.isRepresentative`, next, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-3">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Tenants
          </h5>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({fields.length}
            {capacity != null && ` / ${capacity}`})
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          People living in the room under this lease. A draft lease can be saved
          without tenants; mark one as the representative who signs the lease.
        </p>
      </div>

      <TenantLookupField
        excludeUserIds={tenants.map((tenant) => tenant.userId)}
        disabled={isFull}
        onSelect={(tenant) =>
          append({
            userId: tenant.userId,
            fullName: tenant.fullName,
            phone: tenant.phone ?? "",
            isRepresentative: fields.length === 0,
            joinedDate: "",
          })
        }
      />

      {errors.tenants?.root?.message && (
        <p className="text-error-500 text-sm">{errors.tenants.root.message}</p>
      )}
      {errors.tenants?.message && (
        <p className="text-error-500 text-sm">{errors.tenants.message}</p>
      )}

      {fields.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tenants yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="grid grid-cols-1 items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_150px_200px_36px] dark:border-gray-800"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {field.fullName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {field.phone || "No phone number"}
                </p>
              </div>

              <Controller
                name={`tenants.${index}.isRepresentative`}
                control={control}
                render={({ field: { value } }) => (
                  <Checkbox
                    id={`tenants.${index}.isRepresentative`}
                    label="Representative"
                    checked={value}
                    onChange={(checked) => setRepresentative(index, checked)}
                  />
                )}
              />

              <Controller
                name={`tenants.${index}.joinedDate`}
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <DatePicker
                    id={`tenants.${index}.joinedDate`}
                    placeholder="Joined on start date"
                    clearable
                    value={value}
                    onChange={(_, dateStr) => onChange(dateStr)}
                    onBlur={onBlur}
                    error={!!errors.tenants?.[index]?.joinedDate}
                    hint={errors.tenants?.[index]?.joinedDate?.message}
                  />
                )}
              />

              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${field.fullName}`}
                className="hover:text-error-500 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
