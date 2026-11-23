import React from "react";
import Link from "next/link";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceStatus } from "@/features/invoices/constants";
import type { Invoice } from "@/features/invoices/types";
import { formatBillingMonth } from "@/features/invoices/utils";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface InvoicesTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  emptyMessage?: string;
}

const Amount: React.FC<{ invoice: Invoice; value: number }> = ({
  invoice,
  value,
}) => {
  const isCancelled = invoice.status === InvoiceStatus.Cancelled;

  return (
    <span className={isCancelled ? "text-gray-400 line-through" : ""}>
      {formatCurrency(value)}
    </span>
  );
};

export function InvoicesTable({
  invoices,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortOrder,
  onSortChange,
  emptyMessage = "No invoices found.",
}: InvoicesTableProps) {
  const columns: SortableColumn<Invoice>[] = [
    {
      label: "Invoice #",
      field: "invoiceNumber",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (invoice) => (
        <Link
          href={ROUTES.invoiceDetail(invoice.id)}
          className="text-brand-500 hover:text-brand-600"
        >
          {invoice.invoiceNumber}
        </Link>
      ),
    },
    {
      label: "Month",
      field: "billingMonth",
      render: (invoice) => formatBillingMonth(invoice.billingMonth),
    },
    {
      label: "Room",
      render: (invoice) => (
        <div>
          <p className="text-gray-800 dark:text-white/90">
            Room {invoice.roomNumber}
          </p>
          <p className="text-theme-xs">{invoice.propertyName}</p>
        </div>
      ),
    },
    {
      label: "Lease",
      render: (invoice) => (
        <Link
          href={ROUTES.leaseDetail(invoice.leaseId)}
          className="text-brand-500 hover:text-brand-600"
        >
          {invoice.leaseCode}
        </Link>
      ),
    },
    {
      label: "Due date",
      field: "dueDate",
      render: (invoice) => (
        <span
          className={
            invoice.status === InvoiceStatus.Overdue
              ? "text-error-500 font-medium"
              : ""
          }
        >
          {formatDate(invoice.dueDate, DateFormat.Date)}
        </span>
      ),
    },
    {
      label: "Total",
      field: "totalAmount",
      render: (invoice) => (
        <Amount invoice={invoice} value={invoice.totalAmount} />
      ),
    },
    {
      label: "Remaining",
      render: (invoice) => (
        <Amount invoice={invoice} value={invoice.remainingAmount} />
      ),
    },
    {
      label: "Status",
      render: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
    },
  ];

  return (
    <SortableDataTable
      columns={columns}
      rows={invoices}
      rowKey={(invoice) => invoice.id}
      isLoading={isLoading}
      isFetching={isFetching}
      hasError={hasError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      emptyMessage={emptyMessage}
      minWidthClassName="min-w-[1000px]"
    />
  );
}
