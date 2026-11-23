"use client";

import React, { useState } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { SearchableSelect } from "@/components/form/SearchableSelect";
import { LEASE_STATUS_LABELS, LeaseStatus } from "@/features/leases/constants";
import { leasesApi } from "@/features/leases/api";
import { leaseKeys, useLease } from "@/features/leases/queries";
import type { GetLeasesParams, Lease } from "@/features/leases/types";

const BILLABLE_LEASE_STATUSES = [
  LeaseStatus.Active,
  LeaseStatus.Expired,
  LeaseStatus.Terminated,
];

const LEASES_PER_STATUS = 20;

export const formatLeaseOption = (lease: Lease) =>
  `${lease.leaseCode} · Room ${lease.roomNumber}${
    lease.status === LeaseStatus.Active
      ? ""
      : ` (${LEASE_STATUS_LABELS[lease.status].toLowerCase()})`
  }`;

interface InvoiceLeaseSelectProps {
  id?: string;
  value: string;
  onChange: (leaseId: string) => void;
  error?: boolean;
}

export const InvoiceLeaseSelect: React.FC<InvoiceLeaseSelectProps> = ({
  id,
  value,
  onChange,
  error,
}) => {
  const [search, setSearch] = useState("");
  const results = useQueries({
    queries: BILLABLE_LEASE_STATUSES.map((status) => {
      const params: GetLeasesParams = {
        status,
        search: search || undefined,
        pageSize: LEASES_PER_STATUS,
        sortBy: "startDate",
        sortOrder: "desc",
      };
      return {
        queryKey: leaseKeys.list(params),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          leasesApi.getLeases(params, signal),
        placeholderData: keepPreviousData,
      };
    }),
  });
  const isFetching = results.some((result) => result.isFetching);
  const { data: selectedLease } = useLease(value, { enabled: !!value });

  const options = results
    .flatMap((result) => result.data?.items ?? [])
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((lease) => ({ value: lease.id, label: formatLeaseOption(lease) }));

  return (
    <SearchableSelect
      id={id}
      options={options}
      value={value}
      valueLabel={selectedLease ? formatLeaseOption(selectedLease) : undefined}
      onChange={onChange}
      onSearchChange={setSearch}
      placeholder="Select a lease"
      searchPlaceholder="Search by lease code"
      isLoading={isFetching}
      emptyMessage="No billable leases found"
      error={error}
    />
  );
};
