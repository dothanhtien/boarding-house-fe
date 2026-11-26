"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { LeaseStatus } from "@/features/leases/constants";
import { useMyLeases } from "../queries";
import { MyLeaseCard } from "./MyLeaseCard";
import { PortalList } from "./ui/PortalList";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalPageHeader } from "./ui/PortalPageHeader";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: LeaseStatus.Active, label: "Active" },
  { value: LeaseStatus.Expired, label: "Expired" },
  { value: LeaseStatus.Terminated, label: "Terminated" },
];

export const MyLeasesView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LeaseStatus | "">("");
  const { data, isLoading, error } = useMyLeases({
    page,
    pageSize: PAGE_SIZE,
    status: status || undefined,
  });
  const leases = data?.items ?? [];

  return (
    <div>
      <PortalPageHeader
        title="Leases"
        aside={
          <div className="w-full sm:w-44">
            <Label htmlFor="myLeaseStatusFilter" className="sr-only">
              Status
            </Label>
            <Select
              id="myLeaseStatusFilter"
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              value={status}
              onChange={(value) => {
                setStatus(value as LeaseStatus | "");
                setPage(1);
              }}
            />
          </div>
        }
      />

      {isLoading && <PortalMessage>Loading...</PortalMessage>}
      {error && <PortalMessage tone="error">{error.message}</PortalMessage>}
      {data && leases.length === 0 && (
        <PortalMessage>
          {status ? "No leases with this status." : "You have no leases yet."}
        </PortalMessage>
      )}

      {leases.length > 0 && (
        <PortalList>
          {leases.map((lease) => (
            <MyLeaseCard key={lease.id} lease={lease} />
          ))}
        </PortalList>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
