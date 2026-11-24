"use client";

import React, { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/form/SearchableSelect";
import { useVietQrBanks } from "@/features/vietqr/queries";
import { formatBankOption } from "@/features/vietqr/utils";

const NOT_SET = { value: "", label: "Not set" };

interface BankSelectFieldProps {
  id?: string;
  value: string;
  onChange: (bin: string) => void;
  error?: boolean;
}

export const BankSelectField: React.FC<BankSelectFieldProps> = ({
  id,
  value,
  onChange,
  error,
}) => {
  const [search, setSearch] = useState("");
  const { data: banks = [], isLoading } = useVietQrBanks();

  const options = useMemo(() => {
    const term = search.toLowerCase();
    const matches = banks
      .filter(
        (bank) =>
          !term ||
          bank.shortName.toLowerCase().includes(term) ||
          bank.code.toLowerCase().includes(term),
      )
      .map((bank) => ({ value: bank.bin, label: formatBankOption(bank) }));
    return term ? matches : [NOT_SET, ...matches];
  }, [banks, search]);

  const selected = banks.find((bank) => bank.bin === value);

  return (
    <SearchableSelect
      id={id}
      options={options}
      value={value}
      valueLabel={
        selected ? formatBankOption(selected) : value ? value : undefined
      }
      onChange={onChange}
      onSearchChange={setSearch}
      debounceMs={0}
      placeholder="Not set"
      searchPlaceholder="Search by bank name or code"
      isLoading={isLoading}
      emptyMessage="No banks found"
      error={error}
    />
  );
};
