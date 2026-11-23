import React, { useMemo } from "react";
import { Select } from "@/components/form/Select";
import { getInvoiceMonthOptions } from "@/features/invoices/utils";
import { getCurrentUtcMonth } from "@/utils/month";

interface InvoiceMonthSelectProps {
  id?: string;
  value: string;
  onChange: (month: string) => void;
  /** Label of the empty option. Without it, the empty option can't be picked. */
  placeholder?: string;
  allowEmpty?: boolean;
  /** How many months back the list goes. */
  lookback?: number;
  className?: string;
  error?: boolean;
}

export const InvoiceMonthSelect: React.FC<InvoiceMonthSelectProps> = ({
  id,
  value,
  onChange,
  placeholder = "Select month",
  allowEmpty = false,
  lookback,
  className,
  error,
}) => {
  const currentMonth = getCurrentUtcMonth();
  const options = useMemo(
    () => getInvoiceMonthOptions(lookback),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lookback, currentMonth],
  );

  return (
    <Select
      id={id}
      className={className}
      options={options}
      placeholder={placeholder}
      value={value}
      error={error}
      onChange={(month) => {
        if (month || allowEmpty) onChange(month);
      }}
    />
  );
};
