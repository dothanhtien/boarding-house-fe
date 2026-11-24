"use client";

import React from "react";
import { Landmark, ReceiptText, SquarePen, TriangleAlert } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { useOrganizationSettings } from "../queries";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { OrganizationSettingsEditModal } from "./OrganizationSettingsEditModal";
import { useVietQrBanks } from "@/features/vietqr/queries";
import { formatBankOption } from "@/features/vietqr/utils";
import type { OrganizationSettings } from "../types";

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

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-right text-sm font-medium wrap-break-word text-gray-800 dark:text-white/90">
      {children ?? "—"}
    </dd>
  </div>
);

const SettingsSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="rounded-xl border border-gray-100 px-4 pt-4 pb-1 dark:border-gray-800">
    <div className="mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-300">
      {icon}
      <h5 className="text-sm font-semibold">{title}</h5>
    </div>
    {children}
  </div>
);

const formatLateFee = (settings: OrganizationSettings) => {
  if (settings.lateFeeValue === null) return null;
  const amount =
    settings.lateFeeType === "percent"
      ? `${settings.lateFeeValue}%`
      : formatCurrency(settings.lateFeeValue, { currency: settings.currency });
  const typeLabel = settings.lateFeeType
    ? LATE_FEE_TYPE_LABELS[settings.lateFeeType]
    : null;
  return (
    <>
      {amount}
      {typeLabel && (
        <span className="ml-1.5 font-normal text-gray-500 dark:text-gray-400">
          ({typeLabel.toLowerCase()})
        </span>
      )}
    </>
  );
};

const BillingSection: React.FC<{ settings: OrganizationSettings }> = ({
  settings,
}) => (
  <SettingsSection
    icon={<ReceiptText className="h-4 w-4" aria-hidden />}
    title="Billing"
  >
    <dl className="divide-y divide-gray-100 dark:divide-gray-800">
      <DetailRow label="Currency">{settings.currency}</DetailRow>
      <DetailRow label="Default billing day">
        {settings.defaultBillingDay !== null
          ? `Day ${settings.defaultBillingDay}`
          : null}
      </DetailRow>
      <DetailRow label="Late fee">{formatLateFee(settings)}</DetailRow>
      <DetailRow label="Late fee grace period">
        {settings.lateFeeGraceDays !== null
          ? `${settings.lateFeeGraceDays} day${settings.lateFeeGraceDays === 1 ? "" : "s"}`
          : null}
      </DetailRow>
      <DetailRow label="VAT rate">
        {settings.vatRate !== null ? `${settings.vatRate}%` : null}
      </DetailRow>
    </dl>
  </SettingsSection>
);

const PaymentAccountSection: React.FC<{ settings: OrganizationSettings }> = ({
  settings,
}) => {
  const { data: banks } = useVietQrBanks();
  const isConfigured = !!settings.bankBin && !!settings.bankAccountNumber;
  const bank = banks?.find((item) => item.bin === settings.bankBin);

  return (
    <SettingsSection
      icon={<Landmark className="h-4 w-4" aria-hidden />}
      title="Payment account"
    >
      {isConfigured ? (
        <dl className="divide-y divide-gray-100 dark:divide-gray-800">
          <DetailRow label="Bank">
            {bank ? formatBankOption(bank) : settings.bankBin}
          </DetailRow>
          <DetailRow label="Account number">
            <span className="font-mono tracking-wide">
              {settings.bankAccountNumber}
            </span>
          </DetailRow>
          <DetailRow label="Account holder">
            {settings.bankAccountName}
          </DetailRow>
          <DetailRow label="Bank name / branch">{settings.bankName}</DetailRow>
        </dl>
      ) : (
        <div className="border-warning-500/30 bg-warning-50 dark:bg-warning-500/10 my-3 flex items-start gap-3 rounded-lg border px-4 py-3">
          <TriangleAlert
            className="text-warning-500 mt-0.5 h-4 w-4 shrink-0"
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              Not configured
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              Invoices can&apos;t show a payment QR until a bank account is
              added.
            </p>
          </div>
        </div>
      )}
    </SettingsSection>
  );
};

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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Settings
          </h4>
          {settings && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Defaults applied to properties, leases and invoices · Last updated{" "}
              {formatDate(settings.updatedAt)}
            </p>
          )}
        </div>

        {settings && (
          <button
            type="button"
            onClick={openModal}
            className="shadow-theme-xs inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-800 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
          >
            <SquarePen className="h-4 w-4" aria-hidden />
            Edit
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}

      {error && !isLoading && (
        <p className="text-error-500 text-sm">{error.message}</p>
      )}

      {settings && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <BillingSection settings={settings} />
          <PaymentAccountSection settings={settings} />
        </div>
      )}

      {settings && (
        <OrganizationSettingsEditModal
          organizationId={organizationId}
          settings={settings}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
    </section>
  );
};
