import React from "react";
import type { InvoiceLine } from "@/features/invoices/types";
import { formatCurrency } from "@/utils/currency";

const quantityFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

interface InvoiceLinesTableProps {
  lines: InvoiceLine[];
}

export const InvoiceLinesTable: React.FC<InvoiceLinesTableProps> = ({
  lines,
}) => {
  if (lines.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No lines.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-theme-xs border-b border-gray-100 text-left text-gray-500 dark:border-white/5 dark:text-gray-400">
            <th className="py-2 pr-3 font-medium">Description</th>
            <th className="px-3 py-2 text-right font-medium">Qty</th>
            <th className="px-3 py-2 text-right font-medium">Unit price</th>
            <th className="py-2 pl-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr
              key={`${line.sortOrder}-${index}`}
              className="border-b border-gray-100 last:border-0 dark:border-white/5"
            >
              <td className="py-2.5 pr-3 text-gray-800 dark:text-white/90">
                {line.description}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums dark:text-gray-400">
                {quantityFormatter.format(line.quantity)}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums dark:text-gray-400">
                {formatCurrency(line.unitPrice)}
              </td>
              <td
                className={`py-2.5 pl-3 text-right font-medium tabular-nums ${
                  line.amount < 0
                    ? "text-success-600"
                    : "text-gray-800 dark:text-white/90"
                }`}
              >
                {formatCurrency(line.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
