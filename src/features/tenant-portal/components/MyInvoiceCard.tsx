import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import {
  formatBillingMonth,
  isInvoiceOverdue,
} from "@/features/invoices/utils";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import type { MyInvoice } from "../types";
import { isInvoiceUnpaid } from "../utils";

interface MyInvoiceCardProps {
  invoice: MyInvoice;
}

export const MyInvoiceCard: React.FC<MyInvoiceCardProps> = ({ invoice }) => {
  const unpaid = isInvoiceUnpaid(invoice);
  const isOverdue = isInvoiceOverdue(invoice);

  return (
    <li>
      <Link
        href={ROUTES.tenantPortalInvoiceDetail(invoice.id)}
        className="hover:border-brand-300 dark:hover:border-brand-800 block rounded-2xl border border-gray-200 bg-white p-4 transition sm:p-5 dark:border-gray-800 dark:bg-white/3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-white/90">
              {formatBillingMonth(invoice.billingMonth)}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {invoice.invoiceNumber}
              </span>
            </p>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
              Room {invoice.roomNumber} · {invoice.propertyName} ·{" "}
              {invoice.organizationName}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
          <span
            className={
              isOverdue && unpaid
                ? "text-error-500"
                : "text-gray-600 dark:text-gray-400"
            }
          >
            Due {formatDate(invoice.dueDate, DateFormat.Date)}
          </span>
          {unpaid ? (
            <span className="font-semibold text-gray-800 tabular-nums dark:text-white/90">
              {formatCurrency(invoice.remainingAmount)}
              <span className="font-normal text-gray-500"> to pay</span>
            </span>
          ) : (
            <span className="font-medium text-gray-600 tabular-nums dark:text-gray-400">
              {formatCurrency(invoice.totalAmount)}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};
