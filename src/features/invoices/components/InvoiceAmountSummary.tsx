import React from "react";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { isInvoiceOverdue } from "../utils";
import { InvoiceDetail } from "../types";

const SummaryItem: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className = "" }) => (
  <div>
    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
    <dd
      className={`mt-1 font-medium tabular-nums ${className || "text-gray-800 dark:text-white/90"}`}
    >
      {children}
    </dd>
  </div>
);

export const InvoiceAmountSummary: React.FC<{ invoice: InvoiceDetail }> = ({
  invoice,
}) => {
  const isOverdue = isInvoiceOverdue(invoice);
  const overdueClassName = "text-error-500";

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      <SummaryItem
        label="Remaining"
        className={`text-2xl ${
          isOverdue && invoice.remainingAmount > 0
            ? overdueClassName
            : "text-gray-800 dark:text-white/90"
        }`}
      >
        {formatCurrency(invoice.remainingAmount)}
      </SummaryItem>
      <SummaryItem label="Total">
        {formatCurrency(invoice.totalAmount)}
      </SummaryItem>
      <SummaryItem label="Paid">
        {formatCurrency(invoice.paidAmount)}
      </SummaryItem>
      <SummaryItem
        label="Due date"
        className={isOverdue ? overdueClassName : undefined}
      >
        {formatDate(invoice.dueDate, DateFormat.Date)}
      </SummaryItem>
    </dl>
  );
};
