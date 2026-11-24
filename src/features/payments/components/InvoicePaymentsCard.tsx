"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import type { Invoice } from "@/features/invoices/types";
import { PaymentStatus } from "@/features/payments/constants";
import { useInvoicePayments } from "@/features/payments/queries";
import type { Payment } from "@/features/payments/types";
import {
  canRecordPayment,
  canVoidPayment,
  sumPending,
} from "@/features/payments/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { PlusIcon } from "@/icons";
import { formatCurrency } from "@/utils/currency";
import { ConfirmPaymentDialog } from "./ConfirmPaymentDialog";
import { PaymentRow } from "./PaymentRow";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { VoidPaymentModal } from "./VoidPaymentModal";

interface InvoicePaymentsCardProps {
  invoice: Invoice;
}

export const InvoicePaymentsCard: React.FC<InvoicePaymentsCardProps> = ({
  invoice,
}) => {
  const { currentOrgRoleSlug } = useUserRole();
  const { data: payments, isLoading, error } = useInvoicePayments(invoice.id);
  const [isRecording, setIsRecording] = useState(false);
  const [confirming, setConfirming] = useState<Payment | null>(null);
  const [voiding, setVoiding] = useState<Payment | null>(null);

  const newestFirst = [...(payments ?? [])].sort((a, b) =>
    b.paymentDate.localeCompare(a.paymentDate),
  );
  const pending = newestFirst.filter(
    (payment) => payment.status === PaymentStatus.Pending,
  );

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Payments
        </h4>

        {canRecordPayment(invoice) && (
          <Button
            type="button"
            size="sm"
            startIcon={<PlusIcon />}
            onClick={() => setIsRecording(true)}
          >
            Record payment
          </Button>
        )}
      </div>

      {pending.length > 0 && (
        <p className="border-warning-500/30 bg-warning-50 dark:bg-warning-500/15 mb-4 rounded-lg border px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          {pending.length === 1
            ? "1 payment awaiting confirmation"
            : `${pending.length} payments awaiting confirmation`}{" "}
          · {formatCurrency(sumPending(pending))}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}

      {error && <p className="text-error-500 text-sm">{error.message}</p>}

      {payments && payments.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No payments yet.
        </p>
      )}

      {newestFirst.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-white/5">
          {newestFirst.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              canVoid={canVoidPayment(currentOrgRoleSlug, payment)}
              onConfirm={() => setConfirming(payment)}
              onVoid={() => setVoiding(payment)}
            />
          ))}
        </ul>
      )}

      {isRecording && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setIsRecording(false)}
        />
      )}

      {confirming && (
        <ConfirmPaymentDialog
          payment={confirming}
          invoice={invoice}
          onClose={() => setConfirming(null)}
        />
      )}

      {voiding && (
        <VoidPaymentModal payment={voiding} onClose={() => setVoiding(null)} />
      )}
    </div>
  );
};
