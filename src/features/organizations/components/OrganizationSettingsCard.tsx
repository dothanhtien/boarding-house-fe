"use client";

import React from "react";
import { useModal } from "@/hooks/useModal";
import { useOrganizationSettings } from "../queries";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { PencilIcon } from "@/icons";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { OrganizationSettingsEditModal } from "./OrganizationSettingsEditModal";

interface OrganizationSettingsCardProps {
  organizationId: string;
}

export const LATE_FEE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "percent", label: "Percent" },
  { value: "fixed", label: "Fixed amount" },
];

const LATE_FEE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  LATE_FEE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

export const OrganizationSettingsCard: React.FC<
  OrganizationSettingsCardProps
> = ({ organizationId }) => {
  const {
    data: settings,
    isLoading,
    error,
  } = useOrganizationSettings(organizationId);
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3 lg:mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Organization settings
            </h4>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          )}

          {error && !isLoading && (
            <p className="text-error-500 text-sm">{error.message}</p>
          )}

          {settings && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr] lg:gap-7 2xl:gap-x-32">
              <InfoItem label="Currency" value={settings.currency} />
              <InfoItem
                label="Default billing day"
                value={settings.defaultBillingDay}
              />
              <InfoItem
                label="Late fee type"
                value={
                  settings.lateFeeType
                    ? LATE_FEE_TYPE_LABELS[settings.lateFeeType]
                    : null
                }
              />
              <InfoItem
                label="Late fee value"
                value={
                  settings.lateFeeValue === null
                    ? null
                    : settings.lateFeeType === "percent"
                      ? `${settings.lateFeeValue}%`
                      : formatCurrency(settings.lateFeeValue, {
                          currency: settings.currency,
                        })
                }
              />
              <InfoItem
                label="Late fee grace days"
                value={settings.lateFeeGraceDays}
              />
              <InfoItem
                label="VAT rate"
                value={
                  settings.vatRate !== null ? `${settings.vatRate}%` : null
                }
              />
              <InfoItem label="Bank name" value={settings.bankName} />
              <InfoItem
                label="Bank account number"
                value={settings.bankAccountNumber}
              />
              <InfoItem
                label="Bank account name"
                value={settings.bankAccountName}
              />
              <InfoItem
                label="Last updated"
                value={formatDate(settings.updatedAt)}
              />
            </div>
          )}
        </div>

        {settings && (
          <button
            type="button"
            onClick={openModal}
            className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {settings && (
        <OrganizationSettingsEditModal
          organizationId={organizationId}
          settings={settings}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
