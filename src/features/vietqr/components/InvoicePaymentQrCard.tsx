"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import { RoleSlugs } from "@/enums/roles";
import type { Invoice } from "@/features/invoices/types";
import { RecordPaymentModal } from "@/features/payments/components/RecordPaymentModal";
import { PaymentMethod } from "@/features/payments/constants";
import { useInvoicePayments } from "@/features/payments/queries";
import { canRecordPayment, sumPending } from "@/features/payments/utils";
import { useInvoicePaymentQr } from "@/features/vietqr/queries";
import type { InvoicePaymentQr } from "@/features/vietqr/types";
import { QR_IMAGE_SIZE, useQrDataUrl } from "@/features/vietqr/useQrDataUrl";
import {
  isBankNotConfiguredError,
  isQrAvailable,
} from "@/features/vietqr/utils";
import { downloadQrImage } from "@/features/vietqr/downloadQrImage";
import { useUserRole } from "@/hooks/useUserRole";
import { formatCurrency } from "@/utils/currency";

const OPEN_STORAGE_KEY = "invoice-payment-qr-open";

const readOpenPreference = () => {
  try {
    return window.localStorage.getItem(OPEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeOpenPreference = (isOpen: boolean) => {
  try {
    window.localStorage.setItem(OPEN_STORAGE_KEY, isOpen ? "1" : "0");
  } catch {}
};

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Couldn't copy the ${label.toLowerCase()}`);
  }
}

interface QrInfoRowProps {
  label: string;
  value: string;
  display?: React.ReactNode;
  copyable?: boolean;
}

const QrInfoRow: React.FC<QrInfoRowProps> = ({
  label,
  value,
  display,
  copyable = false,
}) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
        {display ?? value}
      </p>
    </div>
    {copyable && (
      <button
        type="button"
        aria-label={`Copy ${label.toLowerCase()}`}
        onClick={() => copyToClipboard(value, label)}
        className="hover:text-brand-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition dark:text-gray-400"
      >
        <Copy className="h-4 w-4" aria-hidden />
      </button>
    )}
  </div>
);

interface QrContentProps {
  invoice: Invoice;
  qr: InvoicePaymentQr;
  onRecordTransfer: (qr: InvoicePaymentQr) => void;
}

const QrContent: React.FC<QrContentProps> = ({
  invoice,
  qr,
  onRecordTransfer,
}) => {
  const { dataUrl, error } = useQrDataUrl(qr.payload);
  const { data: payments } = useInvoicePayments(invoice.id);
  const pendingTotal = sumPending(payments ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, nothing for next/image to optimize
          <img
            src={dataUrl}
            alt={`VietQR code to pay ${qr.invoiceNumber}`}
            width={QR_IMAGE_SIZE}
            height={QR_IMAGE_SIZE}
            className="h-auto w-full max-w-[280px] rounded-lg border border-gray-200 dark:border-gray-800"
          />
        ) : (
          <div
            className="flex aspect-square w-full max-w-[280px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700"
            role={error ? "alert" : undefined}
          >
            {error ? "Couldn't draw the QR code." : "Drawing QR code…"}
          </div>
        )}
      </div>

      {pendingTotal > 0 && (
        <p className="border-warning-500/30 bg-warning-50 dark:bg-warning-500/15 rounded-lg border px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          A pending payment of {formatCurrency(pendingTotal)} is not deducted
          yet. Confirm it first if the tenant already paid.
        </p>
      )}

      <div className="divide-y divide-gray-100 dark:divide-white/5">
        <QrInfoRow label="Bank" value={qr.bankShortName} />
        <QrInfoRow label="Account number" value={qr.accountNumber} copyable />
        {qr.accountName && (
          <QrInfoRow label="Account holder" value={qr.accountName} />
        )}
        <QrInfoRow
          label="Amount"
          value={String(qr.amount)}
          display={formatCurrency(qr.amount)}
          copyable
        />
        <QrInfoRow
          label="Transfer content"
          value={qr.transferContent}
          copyable
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<Download className="h-4 w-4" aria-hidden />}
          disabled={!dataUrl}
          onClick={() => dataUrl && downloadQrImage(qr, dataUrl)}
          className="flex-1"
        >
          Download PNG
        </Button>
        {canRecordPayment(invoice) && (
          <Button
            type="button"
            size="sm"
            onClick={() => onRecordTransfer(qr)}
            className="flex-1"
          >
            Record this transfer
          </Button>
        )}
      </div>
    </div>
  );
};

interface InvoicePaymentQrCardProps {
  invoice: Invoice;
}

export const InvoicePaymentQrCard: React.FC<InvoicePaymentQrCardProps> = ({
  invoice,
}) => {
  const [isOpen, setIsOpen] = useState(readOpenPreference);
  const [recordingAmount, setRecordingAmount] = useState<number | null>(null);
  const { currentOrgRoleSlug } = useUserRole();
  const isAvailable = isQrAvailable(invoice);
  const {
    data: qr,
    isLoading,
    error,
  } = useInvoicePaymentQr(invoice.id, { enabled: isAvailable && isOpen });

  if (!isAvailable) return null;

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    writeOpenPreference(next);
  };

  const renderError = () => {
    if (!error) return null;
    if (!isBankNotConfiguredError(error)) {
      return <p className="text-error-500 text-sm">{error.message}</p>;
    }
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Set up the organization&apos;s bank account to show a payment QR.{" "}
        {currentOrgRoleSlug === RoleSlugs.OrganizationAdmin ? (
          <Link
            href={ROUTES.organizationDetail(invoice.organizationId)}
            className="text-brand-500 hover:text-brand-600 font-medium hover:underline"
          >
            Open organization settings
          </Link>
        ) : (
          "Ask an organization admin to set it up."
        )}
      </p>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Pay by bank transfer
        </h4>
        <span className="text-brand-500 flex items-center gap-1 text-sm font-medium">
          {isOpen ? "Hide QR" : "Show QR"}
          {isOpen ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4">
          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          )}
          {renderError()}
          {qr && !error && (
            <QrContent
              invoice={invoice}
              qr={qr}
              onRecordTransfer={(current) => setRecordingAmount(current.amount)}
            />
          )}
        </div>
      )}

      {recordingAmount !== null && (
        <RecordPaymentModal
          invoice={invoice}
          defaultValues={{
            amount: String(recordingAmount),
            method: PaymentMethod.BankTransfer,
            confirm: false,
          }}
          onClose={() => setRecordingAmount(null)}
        />
      )}
    </div>
  );
};
