import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routeDefinition";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/constants";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import type { MyPayment } from "../types";

interface MyPaymentCardProps {
  payment: MyPayment;
  showInvoice?: boolean;
}

export const MyPaymentCard: React.FC<MyPaymentCardProps> = ({
  payment,
  showInvoice = true,
}) => (
  <li className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-gray-800 tabular-nums dark:text-white/90">
          {formatCurrency(payment.amount)}
        </p>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {PAYMENT_METHOD_LABELS[payment.method]} ·{" "}
          {formatDate(payment.paymentDate, DateFormat.DateTime)}
        </p>
      </div>
      <PaymentStatusBadge status={payment.status} />
    </div>

    <dl className="mt-3 space-y-1 text-sm">
      {showInvoice && (
        <div className="flex gap-2">
          <dt className="text-gray-500 dark:text-gray-400">Invoice</dt>
          <dd className="min-w-0 truncate">
            <Link
              href={ROUTES.tenantPortalInvoiceDetail(payment.invoiceId)}
              className="text-brand-500 hover:text-brand-600 font-medium hover:underline"
            >
              {payment.invoiceNumber}
            </Link>
            <span className="text-gray-500 dark:text-gray-400">
              {" "}
              · Room {payment.roomNumber} · {payment.organizationName}
            </span>
          </dd>
        </div>
      )}
      {payment.payerName && (
        <div className="flex gap-2">
          <dt className="text-gray-500 dark:text-gray-400">Paid by</dt>
          <dd className="text-gray-800 dark:text-white/90">
            {payment.payerName}
          </dd>
        </div>
      )}
      {payment.transactionReference && (
        <div className="flex gap-2">
          <dt className="text-gray-500 dark:text-gray-400">Reference</dt>
          <dd className="min-w-0 truncate text-gray-800 dark:text-white/90">
            {payment.transactionReference}
          </dd>
        </div>
      )}
    </dl>
  </li>
);
