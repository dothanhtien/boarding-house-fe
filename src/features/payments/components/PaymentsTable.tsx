import React from "react";
import Link from "next/link";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import { ROUTES } from "@/config/routeDefinition";
import {
  PAYMENT_METHOD_LABELS,
  PaymentStatus,
} from "@/features/payments/constants";
import type { Payment } from "@/features/payments/types";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  emptyMessage: string;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortOrder,
  onSortChange,
  emptyMessage,
}) => {
  const columns: SortableColumn<Payment>[] = [
    {
      label: "Received on",
      field: "paymentDate",
      render: (payment) => formatDate(payment.paymentDate, DateFormat.Date),
    },
    {
      label: "Invoice #",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (payment) => (
        <Link
          href={ROUTES.invoiceDetail(payment.invoiceId)}
          className="text-brand-500 hover:text-brand-600"
        >
          {payment.invoiceNumber}
        </Link>
      ),
    },
    {
      label: "Room",
      render: (payment) => (
        <div>
          <p className="text-gray-800 dark:text-white/90">
            Room {payment.roomNumber}
          </p>
          <p className="text-theme-xs">{payment.propertyName}</p>
        </div>
      ),
    },
    {
      label: "Payer",
      render: (payment) => payment.payerName ?? "—",
    },
    {
      label: "Method",
      render: (payment) => PAYMENT_METHOD_LABELS[payment.method],
    },
    {
      label: "Reference",
      render: (payment) => payment.transactionReference ?? "—",
    },
    {
      label: "Amount",
      field: "amount",
      render: (payment) => (
        <span
          className={`tabular-nums ${
            payment.status === PaymentStatus.Voided
              ? "text-gray-400 line-through"
              : "font-medium text-gray-800 dark:text-white/90"
          }`}
        >
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      label: "Status",
      render: (payment) => <PaymentStatusBadge status={payment.status} />,
    },
  ];

  return (
    <SortableDataTable
      columns={columns}
      rows={payments}
      rowKey={(payment) => payment.id}
      isLoading={isLoading}
      isFetching={isFetching}
      hasError={hasError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      emptyMessage={emptyMessage}
      minWidthClassName="min-w-[1100px]"
    />
  );
};
