import { DateFormat, formatDate } from "@/utils/date";
import { InvoiceStatus } from "../constants";
import { InvoiceDetail } from "../types";
import { InvoiceTotalRow } from "./InvoiceTotals";
import { formatCurrency } from "@/utils/currency";

export const InvoiceSummaryCard: React.FC<{ invoice: InvoiceDetail }> = ({
  invoice,
}) => {
  const isOverdue = invoice.status === InvoiceStatus.Overdue;

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
      <p
        className={`mt-1 text-3xl font-medium tabular-nums ${
          isOverdue && invoice.remainingAmount > 0
            ? "text-error-500"
            : "text-gray-800 dark:text-white/90"
        }`}
      >
        {formatCurrency(invoice.remainingAmount)}
      </p>
      <dl className="mt-5 flex flex-col gap-2">
        <InvoiceTotalRow label="Total" value={invoice.totalAmount} />
        <InvoiceTotalRow label="Paid" value={invoice.paidAmount} />
        <div className="flex items-baseline justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <dt>Due date</dt>
          <dd className={isOverdue ? "text-error-500 font-medium" : ""}>
            {formatDate(invoice.dueDate, DateFormat.Date)}
          </dd>
        </div>
      </dl>
    </div>
  );
};
