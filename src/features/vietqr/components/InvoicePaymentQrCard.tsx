"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
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
import {
  isBankNotConfiguredError,
  isQrAvailable,
} from "@/features/vietqr/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { formatCurrency } from "@/utils/currency";
import { PaymentQrPanel } from "./PaymentQrPanel";

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
  const { data: payments } = useInvoicePayments(invoice.id);
  const pendingTotal = sumPending(payments ?? []);

  return (
    <PaymentQrPanel
      qr={qr}
      notice={
        pendingTotal > 0 && (
          <p className="border-warning-500/30 bg-warning-50 dark:bg-warning-500/15 rounded-lg border px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            A pending payment of {formatCurrency(pendingTotal)} is not deducted
            yet. Confirm it first if the tenant already paid.
          </p>
        )
      }
      action={
        canRecordPayment(invoice) && (
          <Button
            type="button"
            size="sm"
            onClick={() => onRecordTransfer(qr)}
            className="flex-1"
          >
            Record this transfer
          </Button>
        )
      }
    />
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
