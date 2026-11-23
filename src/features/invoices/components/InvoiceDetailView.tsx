"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CircleX, SquarePen } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceStatus } from "@/features/invoices/constants";
import { useInvoice } from "@/features/invoices/queries";
import {
  canCancelInvoice,
  formatBillingMonth,
  isInvoiceCancellable,
  isInvoiceEditable,
} from "@/features/invoices/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { ChevronLeftIcon } from "@/icons";
import { DateFormat, formatDate } from "@/utils/date";
import { CancelInvoiceModal } from "./CancelInvoiceModal";
import { EditInvoiceModal } from "./EditInvoiceModal";
import { InvoiceLinesTable } from "./InvoiceLinesTable";
import { InvoiceTotals } from "./InvoiceTotals";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceStatusTimeline } from "./InvoiceStatusTimeline";
import { InvoiceSummaryCard } from "./InvoiceSummaryCard";

interface InvoiceDetailViewProps {
  invoiceId: string;
}

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  invoiceId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { currentOrgRoleSlug } = useUserRole();
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const canEdit = !!invoice && isInvoiceEditable(invoice);
  const canCancel =
    !!invoice &&
    isInvoiceCancellable(invoice) &&
    canCancelInvoice(currentOrgRoleSlug);
  const isCancelled = invoice?.status === InvoiceStatus.Cancelled;

  return (
    <div>
      <PageBreadcrumb
        pageTitle={invoice ? `Invoice ${invoice.invoiceNumber}` : "Invoice"}
      />

      <Link
        href={ROUTES.invoices}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to invoices
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        {invoice && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {invoice.invoiceNumber}
                    </h4>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {formatBillingMonth(invoice.billingMonth)} ·{" "}
                    <Link
                      href={ROUTES.roomDetail(
                        invoice.propertyId,
                        invoice.roomId,
                      )}
                      className="text-brand-500 hover:text-brand-600 hover:underline"
                    >
                      Room {invoice.roomNumber}
                    </Link>{" "}
                    · {invoice.propertyName} · Lease{" "}
                    <Link
                      href={ROUTES.leaseDetail(invoice.leaseId)}
                      className="text-brand-500 hover:text-brand-600 hover:underline"
                    >
                      {invoice.leaseCode}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Created {formatDate(invoice.createdAt, DateFormat.DateTime)}
                    {invoice.updatedAt &&
                      ` · updated ${formatDate(invoice.updatedAt, DateFormat.DateTime)}`}
                  </p>
                </div>

                {(canEdit || canCancel) && (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="shadow-theme-xs inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-800 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                      >
                        <SquarePen className="h-4 w-4" aria-hidden />
                        Edit
                      </button>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setIsCancelling(true)}
                        className="shadow-theme-xs bg-error-500 hover:bg-error-600 focus-visible:ring-error-500/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition focus-visible:ring-3 focus-visible:outline-hidden sm:w-auto"
                      >
                        <CircleX className="h-4 w-4" aria-hidden />
                        Cancel invoice
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex flex-col gap-6">
                <div
                  className={`rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 ${isCancelled ? "opacity-70" : ""}`}
                >
                  <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Charges
                  </h4>
                  <InvoiceLinesTable lines={invoice.items} />
                  <div className="mt-5 border-t border-gray-100 pt-5 sm:ml-auto sm:max-w-sm dark:border-white/5">
                    <InvoiceTotals {...invoice} />
                  </div>
                </div>

                {invoice.notes && (
                  <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                    <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                      Notes
                    </h4>
                    <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <InvoiceSummaryCard invoice={invoice} />

                <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                  <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Status history
                  </h4>
                  <InvoiceStatusTimeline invoiceId={invoice.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {invoice && isEditing && (
        <EditInvoiceModal
          invoice={invoice}
          onClose={() => setIsEditing(false)}
        />
      )}

      {invoice && isCancelling && (
        <CancelInvoiceModal
          invoice={invoice}
          onClose={() => setIsCancelling(false)}
        />
      )}
    </div>
  );
};
