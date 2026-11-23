import React from "react";
import { formatCurrency } from "@/utils/currency";

interface InvoiceTotalsProps {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  lateFeeAmount?: number;
  discountAmount: number;
  discountReason: string | null;
  totalAmount: number;
  children?: React.ReactNode;
}

export const InvoiceTotalRow: React.FC<{
  label: React.ReactNode;
  value: number;
  strong?: boolean;
  negative?: boolean;
}> = ({ label, value, strong = false, negative = false }) => (
  <div
    className={`flex items-baseline justify-between gap-4 ${
      strong
        ? "text-base font-semibold text-gray-800 dark:text-white/90"
        : "text-sm text-gray-600 dark:text-gray-400"
    }`}
  >
    <dt>{label}</dt>
    <dd className="tabular-nums">
      {negative && value > 0 ? "−" : ""}
      {formatCurrency(value)}
    </dd>
  </div>
);

export const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({
  subtotal,
  vatRate,
  vatAmount,
  lateFeeAmount = 0,
  discountAmount,
  discountReason,
  totalAmount,
  children,
}) => (
  <dl className="flex flex-col gap-2">
    <InvoiceTotalRow label="Subtotal" value={subtotal} />
    {(vatRate > 0 || vatAmount > 0) && (
      <InvoiceTotalRow label={`VAT (${vatRate}%)`} value={vatAmount} />
    )}
    {lateFeeAmount > 0 && (
      <InvoiceTotalRow label="Late fee" value={lateFeeAmount} />
    )}
    {discountAmount > 0 && (
      <InvoiceTotalRow
        label={
          <>
            Discount
            {discountReason && (
              <span className="text-xs text-gray-400"> · {discountReason}</span>
            )}
          </>
        }
        value={discountAmount}
        negative
      />
    )}
    <div className="my-1 border-t border-gray-100 dark:border-white/5" />
    <InvoiceTotalRow label="Total" value={totalAmount} strong />
    {children}
  </dl>
);
