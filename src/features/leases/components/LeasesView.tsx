"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import { ROUTES } from "@/config/routeDefinition";
import {
  LEASE_STATUS_OPTIONS,
  type LeaseStatus,
} from "@/features/leases/constants";
import { useLeases } from "@/features/leases/queries";
import type { Lease } from "@/features/leases/types";
import { usePropertyLookup } from "@/features/properties/queries";
import { useListPageState } from "@/hooks/useListPageState";
import { PlusIcon } from "@/icons";
import { DeleteLeaseDialog } from "./DeleteLeaseDialog";
import { LeasesTable } from "./LeasesTable";

const PAGE_SIZE = 20;

export const LeasesView = () => {
  const {
    page,
    search,
    sortBy,
    sortOrder,
    setSearch,
    handleSortChange,
    handlePageChange,
    handleItemDeleted,
    resetPage,
  } = useListPageState();
  const router = useRouter();
  const [status, setStatus] = useState<LeaseStatus | "">("");
  const [propertyId, setPropertyId] = useState("");
  const [deletingLease, setDeletingLease] = useState<Lease | null>(null);

  const { data: properties = [] } = usePropertyLookup();
  const { data, isLoading, isFetching, error } = useLeases({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    propertyId: propertyId || undefined,
    sortBy,
    sortOrder,
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Leases" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                placeholder="Search by lease code"
                onSearchChange={setSearch}
              />
              <Select
                id="propertyFilter"
                className="sm:w-52"
                options={properties.map((property) => ({
                  value: property.id,
                  label: property.name,
                }))}
                placeholder="All properties"
                value={propertyId}
                onChange={(value) => {
                  setPropertyId(value);
                  resetPage();
                }}
              />
              <Select
                id="statusFilter"
                className="sm:w-40"
                options={LEASE_STATUS_OPTIONS}
                placeholder="All statuses"
                value={status}
                onChange={(value) => {
                  setStatus(value as LeaseStatus | "");
                  resetPage();
                }}
              />
            </div>

            <Button
              size="sm"
              startIcon={<PlusIcon />}
              onClick={() => router.push(ROUTES.createLease())}
            >
              New lease
            </Button>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <LeasesTable
            leases={data?.items ?? []}
            properties={properties}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onDelete={setDeletingLease}
          />

          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={(nextPage) =>
                handlePageChange(nextPage, data.totalPages)
              }
            />
          )}
        </div>
      </div>

      {deletingLease && (
        <DeleteLeaseDialog
          lease={deletingLease}
          onClose={() => setDeletingLease(null)}
          onDeleted={() => handleItemDeleted(data?.items.length ?? 0)}
        />
      )}
    </div>
  );
};
