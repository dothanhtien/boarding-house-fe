"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import {
  InvoiceTotalRow,
  InvoiceTotals,
} from "@/features/invoices/components/InvoiceTotals";
import {
  formatBillingMonth,
  isInvoiceOverdue,
} from "@/features/invoices/utils";
import { isQrAvailable } from "@/features/vietqr/utils";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { useMyInvoice, useMyPayments } from "../queries";
import type { MyInvoiceDetail } from "../types";
import { isInvoiceUnpaid } from "../utils";
import { MyInvoicePaymentQrCard } from "./MyInvoicePaymentQrCard";
import { MyPaymentCard } from "./MyPaymentCard";
import { DetailState } from "./ui/DetailState";
import { InfoItem } from "./ui/InfoItem";
import { PortalList } from "./ui/PortalList";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalPageHeader } from "./ui/PortalPageHeader";
import { PortalSection } from "./ui/PortalSection";

const PAYMENTS_PAGE_SIZE = 50;

const AmountSummary: React.FC<{ invoice: MyInvoiceDetail }> = ({ invoice }) => {
  const unpaid = isInvoiceUnpaid(invoice);
  const isOverdue = isInvoiceOverdue(invoice) && unpaid;

  return (
    <PortalSection>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            {unpaid ? "To pay" : "Total"}
          </dt>
          <dd
            className={`mt-0.5 text-2xl font-semibold tabular-nums ${
              isOverdue ? "text-error-500" : "text-gray-800 dark:text-white/90"
            }`}
          >
            {formatCurrency(
              unpaid ? invoice.remainingAmount : invoice.totalAmount,
            )}
          </dd>
        </div>
        <InfoItem label="Due date">
          <span className={isOverdue ? "text-error-500" : undefined}>
            {formatDate(invoice.dueDate, DateFormat.Date)}
          </span>
        </InfoItem>
        <InfoItem label="Room">
          {invoice.roomNumber} · {invoice.propertyName}
        </InfoItem>
        <InfoItem label="Organization">{invoice.organizationName}</InfoItem>
      </dl>
    </PortalSection>
  );
};

const ItemsSection: React.FC<{ invoice: MyInvoiceDetail }> = ({ invoice }) => (
  <PortalSection title="Details">
    <ul className="divide-y divide-gray-100 dark:divide-white/5">
      {invoice.items.map((item, index) => (
        <li key={index} className="flex items-start justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-800 dark:text-white/90">
              {item.description}
            </p>
            {item.quantity !== 1 && (
              <p className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            )}
          </div>
          <span className="text-sm font-medium text-gray-800 tabular-nums dark:text-white/90">
            {formatCurrency(item.amount)}
          </span>
        </li>
      ))}
    </ul>
    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/5">
      <InvoiceTotals
        subtotal={invoice.subtotal}
        vatRate={invoice.vatRate}
        vatAmount={invoice.vatAmount}
        lateFeeAmount={invoice.lateFeeAmount}
        discountAmount={invoice.discountAmount}
        discountReason={invoice.discountReason}
        totalAmount={invoice.totalAmount}
      >
        {invoice.paidAmount > 0 && (
          <>
            <InvoiceTotalRow label="Paid" value={invoice.paidAmount} negative />
            <InvoiceTotalRow
              label="Remaining"
              value={invoice.remainingAmount}
              strong
            />
          </>
        )}
      </InvoiceTotals>
    </div>
  </PortalSection>
);

const PaymentsSection: React.FC<{ invoiceId: string }> = ({ invoiceId }) => {
  const { data, isLoading, error } = useMyPayments({
    invoiceId,
    pageSize: PAYMENTS_PAGE_SIZE,
  });
  const payments = data?.items ?? [];

  return (
    <PortalSection title="Payments">
      {isLoading && <PortalMessage>Loading...</PortalMessage>}
      {error && <PortalMessage tone="error">{error.message}</PortalMessage>}
      {data && payments.length === 0 && (
        <PortalMessage>No payments for this invoice yet.</PortalMessage>
      )}
      {payments.length > 0 && (
        <PortalList>
          {payments.map((payment) => (
            <MyPaymentCard
              key={payment.id}
              payment={payment}
              showInvoice={false}
            />
          ))}
        </PortalList>
      )}
    </PortalSection>
  );
};

interface MyInvoiceDetailViewProps {
  invoiceId: string;
}

export const MyInvoiceDetailView: React.FC<MyInvoiceDetailViewProps> = ({
  invoiceId,
}) => {
  const { data: invoice, isLoading, error } = useMyInvoice(invoiceId);
  const hasQr = !!invoice && isQrAvailable(invoice);
  const mainColumnClassName = hasQr ? "lg:col-span-2" : "lg:col-span-3";

  return (
    <div>
      <PortalPageHeader
        backHref={ROUTES.tenantPortalInvoices()}
        backLabel="Back to invoices"
        title={
          invoice
            ? `Invoice ${formatBillingMonth(invoice.billingMonth)}`
            : "Invoice"
        }
        subtitle={
          invoice && (
            <>
              {invoice.invoiceNumber} ·{" "}
              <Link
                href={ROUTES.tenantPortalLeaseDetail(invoice.leaseId)}
                className="text-brand-500 hover:text-brand-600 hover:underline"
              >
                {invoice.leaseCode}
              </Link>
            </>
          )
        }
        aside={invoice && <InvoiceStatusBadge status={invoice.status} />}
      />

      <DetailState
        isLoading={isLoading}
        error={error}
        notFoundMessage="This invoice doesn't exist or isn't yours."
      />

      {invoice && (
        <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-3">
          <div className={mainColumnClassName}>
            <AmountSummary invoice={invoice} />
          </div>
          {hasQr && (
            <div className="lg:sticky lg:top-32 lg:col-start-3 lg:row-span-3 lg:row-start-1">
              <MyInvoicePaymentQrCard invoice={invoice} />
            </div>
          )}
          <div className={mainColumnClassName}>
            <ItemsSection invoice={invoice} />
          </div>
          <div className={mainColumnClassName}>
            <PaymentsSection invoiceId={invoice.id} />
          </div>
        </div>
      )}
    </div>
  );
};
