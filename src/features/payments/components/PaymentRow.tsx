"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  PAYMENT_METHOD_LABELS,
  PaymentStatus,
} from "@/features/payments/constants";
import type { Payment } from "@/features/payments/types";
import { canConfirmPayment } from "@/features/payments/utils";
import { useActorName } from "@/hooks/useActorName";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface PaymentRowProps {
  payment: Payment;
  canVoid: boolean;
  onConfirm: () => void;
  onVoid: () => void;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  canVoid,
  onConfirm,
  onVoid,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const actorName = useActorName();
  const isVoided = payment.status === PaymentStatus.Voided;
  const canConfirm = canConfirmPayment(payment);

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-medium tabular-nums ${
                isVoided
                  ? "text-gray-400 line-through"
                  : "text-gray-800 dark:text-white/90"
              }`}
            >
              {formatCurrency(payment.amount)}
            </span>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {PAYMENT_METHOD_LABELS[payment.method]} ·{" "}
            {formatDate(payment.paymentDate, DateFormat.Date)}
            {payment.payerName && ` · ${payment.payerName}`}
            {payment.transactionReference &&
              ` · Ref ${payment.transactionReference}`}
          </p>
          {isVoided && payment.voidReason && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Voided: {payment.voidReason}
            </p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-400">
          <p>
            Recorded {formatDate(payment.createdAt, DateFormat.DateTime)} by{" "}
            {actorName(payment.createdBy)}
          </p>
          {payment.confirmedAt && (
            <p>
              Confirmed {formatDate(payment.confirmedAt, DateFormat.DateTime)}{" "}
              by {actorName(payment.confirmedBy)}
            </p>
          )}
          {payment.voidedAt && (
            <p>
              Voided {formatDate(payment.voidedAt, DateFormat.DateTime)} by{" "}
              {actorName(payment.voidedBy)}
            </p>
          )}
          {payment.note && (
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {payment.note}
            </p>
          )}
        </div>
      )}

      {(canConfirm || canVoid) && (
        <div className="mt-2 flex gap-4">
          {canConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className="text-brand-500 hover:text-brand-600 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm
            </button>
          )}
          {canVoid && (
            <button
              type="button"
              onClick={onVoid}
              className="text-error-500 hover:text-error-600 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Void
            </button>
          )}
        </div>
      )}
    </li>
  );
};
