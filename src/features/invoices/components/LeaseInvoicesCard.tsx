"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceStatus } from "@/features/invoices/constants";
import { useInvoices } from "@/features/invoices/queries";
import { formatBillingMonth } from "@/features/invoices/utils";
import { LeaseStatus } from "@/features/leases/constants";
import type { Lease } from "@/features/leases/types";
import { formatCurrency } from "@/utils/currency";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

const RECENT_INVOICES_LIMIT = 12;

const linkClassName = "text-brand-500 hover:text-brand-600 hover:underline";

interface LeaseInvoicesCardProps {
  lease: Lease;
}

export const LeaseInvoicesCard: React.FC<LeaseInvoicesCardProps> = ({
  lease,
}) => {
  const { data, isLoading, error } = useInvoices({
    leaseId: lease.id,
    pageSize: RECENT_INVOICES_LIMIT,
    sortBy: "billingMonth",
    sortOrder: "desc",
  });
  const invoices = data?.items ?? [];
  const canCreate = lease.status !== LeaseStatus.Draft;
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Invoices
          </h4>
          {data && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({data.totalItems})
            </span>
          )}
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="shadow-theme-xs bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition"
          >
            <PlusIcon />
            Create invoice
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}
      {error && <p className="text-error-500 text-sm">{error.message}</p>}

      {data && invoices.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {canCreate
            ? "No invoices yet."
            : "Activate the lease before creating invoices."}
        </p>
      )}

      {invoices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-theme-xs border-b border-gray-100 text-left text-gray-500 dark:border-white/5 dark:text-gray-400">
                <th className="py-2 pr-3 font-medium">Month</th>
                <th className="px-3 py-2 font-medium">Invoice #</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">Remaining</th>
                <th className="py-2 pl-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const isCancelled = invoice.status === InvoiceStatus.Cancelled;
                const amountClassName = `px-3 py-2.5 text-right tabular-nums ${
                  isCancelled
                    ? "text-gray-400 line-through"
                    : "text-gray-800 dark:text-white/90"
                }`;
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 last:border-0 dark:border-white/5"
                  >
                    <td className="py-2.5 pr-3 text-gray-800 dark:text-white/90">
                      {formatBillingMonth(invoice.billingMonth)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={ROUTES.invoiceDetail(invoice.id)}
                        className={linkClassName}
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className={amountClassName}>
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className={amountClassName}>
                      {formatCurrency(invoice.remainingAmount)}
                    </td>
                    <td className="py-2.5 pl-3">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && (
        <CreateInvoiceModal
          lease={lease}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
};
