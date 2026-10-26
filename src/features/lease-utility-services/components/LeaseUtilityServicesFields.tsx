"use client";

import React from "react";
import Link from "next/link";
import { useFieldArray, useFormContext } from "react-hook-form";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { ROUTES } from "@/config/routeDefinition";
import type { LeaseUtilityServiceSelection } from "@/features/lease-utility-services/schemas";
import { UtilityTypeIcon } from "@/features/utility-services/components/UtilityTypeIcon";
import { UTILITY_BILLING_METHOD_LABELS } from "@/features/utility-services/constants";
import { useUtilityServices } from "@/features/utility-services/queries";
import type { UtilityService } from "@/features/utility-services/types";
import {
  formatUnitPrice,
  supportsQuantity,
} from "@/features/utility-services/utils";

interface LeaseUtilityServicesFieldsProps {
  propertyId: string;
}

type FormValues = { utilityServices: LeaseUtilityServiceSelection[] };

const toSelection = (
  service: UtilityService,
): LeaseUtilityServiceSelection => ({
  serviceId: service.id,
  unitPriceOverride: "",
  quantity: "1",
});

export const LeaseUtilityServicesFields: React.FC<
  LeaseUtilityServicesFieldsProps
> = ({ propertyId }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormValues>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "utilityServices",
  });
  const {
    data: services = [],
    isLoading,
    error,
  } = useUtilityServices({ propertyId, isActive: true });

  const indexOf = (serviceId: string) =>
    fields.findIndex((field) => field.serviceId === serviceId);
  const listError =
    errors.utilityServices?.message ?? errors.utilityServices?.root?.message;
  const allSelected =
    services.length > 0 && services.every((s) => indexOf(s.id) !== -1);

  const toggle = (service: UtilityService, checked: boolean) => {
    const index = indexOf(service.id);
    if (checked && index === -1) append(toSelection(service));
    else if (!checked && index !== -1) remove(index);
  };

  const toggleAll = () => {
    if (allSelected) replace([]);
    else append(services.filter((s) => indexOf(s.id) === -1).map(toSelection));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
            Utility services
          </h5>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose the services this lease is charged for. You can change them
            after the lease is created.
          </p>
        </div>
        {services.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-brand-500 hover:text-brand-600 shrink-0 cursor-pointer text-sm font-medium"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        )}
      </div>

      {listError && <p className="text-error-500 mb-3 text-sm">{listError}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading utility services...
        </p>
      ) : error ? (
        <p className="text-error-500 text-sm">{error.message}</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This property has no active utility services. Set them up in the
          property&apos;s{" "}
          <Link
            href={ROUTES.propertyUtilityServices(propertyId)}
            className="text-brand-500 hover:text-brand-600 hover:underline"
          >
            Utility services tab
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service) => {
            const index = indexOf(service.id);
            const isSelected = index !== -1;
            const rowErrors = isSelected
              ? errors.utilityServices?.[index]
              : undefined;
            const hasQuantity = supportsQuantity(service.billingMethod);
            const rowMessage =
              rowErrors?.message ??
              rowErrors?.serviceId?.message ??
              (hasQuantity ? undefined : rowErrors?.quantity?.message);

            return (
              <li
                key={service.id}
                className={`rounded-lg border px-4 py-3 transition ${
                  isSelected
                    ? "border-brand-300 dark:border-brand-800"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`utility-service-${service.id}`}
                    checked={isSelected}
                    onChange={(checked) => toggle(service, checked)}
                  />
                  <label
                    htmlFor={`utility-service-${service.id}`}
                    className="flex min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-2"
                  >
                    <UtilityTypeIcon
                      type={service.type}
                      className="h-4 w-4 text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {service.name}
                    </span>
                    <Badge size="sm" color="light">
                      {UTILITY_BILLING_METHOD_LABELS[service.billingMethod]}
                    </Badge>
                  </label>
                  <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                    {formatUnitPrice(service.defaultUnitPrice, service.unit)}
                  </span>
                </div>

                {isSelected && (
                  <div
                    key={fields[index].id}
                    className="mt-3 grid grid-cols-1 gap-3 pl-8 sm:grid-cols-2"
                  >
                    <Input
                      id={`utilityServices.${index}.unitPriceOverride`}
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder={`Default: ${formatUnitPrice(service.defaultUnitPrice, service.unit)}`}
                      error={!!rowErrors?.unitPriceOverride}
                      hint={
                        rowErrors?.unitPriceOverride?.message ??
                        "Custom price for this lease. Blank = default price."
                      }
                      {...register(
                        `utilityServices.${index}.unitPriceOverride`,
                      )}
                    />
                    {hasQuantity && (
                      <Input
                        id={`utilityServices.${index}.quantity`}
                        type="number"
                        min={1}
                        error={!!rowErrors?.quantity}
                        hint={
                          rowErrors?.quantity?.message ??
                          `Quantity, e.g. 2 × ${service.name.toLowerCase()}.`
                        }
                        {...register(`utilityServices.${index}.quantity`)}
                      />
                    )}
                  </div>
                )}

                {rowMessage && (
                  <p className="text-error-500 mt-2 pl-8 text-sm">
                    {rowMessage}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
