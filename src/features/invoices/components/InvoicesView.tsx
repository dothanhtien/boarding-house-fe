"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import { ROUTES } from "@/config/routeDefinition";
import {
  INVOICE_FILTER_MONTH_LOOKBACK,
  INVOICE_STATUS_OPTIONS,
  type InvoiceStatus,
} from "@/features/invoices/constants";
import { useInvoices } from "@/features/invoices/queries";
import { usePropertyLookup } from "@/features/properties/queries";
import { useListPageState } from "@/hooks/useListPageState";
import { PlusIcon } from "@/icons";
import { toBillingMonth } from "@/utils/month";
import { InvoiceMonthSelect } from "./InvoiceMonthSelect";
import { InvoicesTable } from "./InvoicesTable";

const PAGE_SIZE = 20;

export const InvoicesView: React.FC = () => {
  const router = useRouter();
  const {
    page,
    search,
    sortBy,
    sortOrder,
    setSearch,
    handleSortChange,
    handlePageChange,
    resetPage,
  } = useListPageState();
  const [propertyId, setPropertyId] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [month, setMonth] = useState("");

  const { data: properties = [] } = usePropertyLookup();
  const { data, isLoading, isFetching, error } = useInvoices({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    propertyId: propertyId || undefined,
    status: status || undefined,
    billingMonth: month ? toBillingMonth(month) : undefined,
    sortBy,
    sortOrder,
  });

  const hasFilters = !!(propertyId || status || month || search);

  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchInput
                placeholder="Search by invoice # or lease code"
                onSearchChange={setSearch}
              />
              <Label htmlFor="invoicePropertyFilter" className="sr-only">
                Property
              </Label>
              <Select
                id="invoicePropertyFilter"
                className="lg:w-52"
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
              <Label htmlFor="invoiceStatusFilter" className="sr-only">
                Status
              </Label>
              <Select
                id="invoiceStatusFilter"
                className="lg:w-44"
                options={INVOICE_STATUS_OPTIONS}
                placeholder="All statuses"
                value={status}
                onChange={(value) => {
                  setStatus(value as InvoiceStatus | "");
                  resetPage();
                }}
              />
              <Label htmlFor="invoiceMonthFilter" className="sr-only">
                Billing month
              </Label>
              <InvoiceMonthSelect
                id="invoiceMonthFilter"
                className="lg:w-40"
                placeholder="All months"
                allowEmpty
                lookback={INVOICE_FILTER_MONTH_LOOKBACK}
                value={month}
                onChange={(value) => {
                  setMonth(value);
                  resetPage();
                }}
              />
            </div>

            <Button
              size="sm"
              className="self-start xl:self-auto"
              startIcon={<PlusIcon />}
              onClick={() => router.push(ROUTES.createInvoice)}
            >
              New invoice
            </Button>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <InvoicesTable
            invoices={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            emptyMessage={
              hasFilters
                ? "No invoices match these filters."
                : "No invoices yet. Create one from a lease."
            }
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
    </div>
  );
};
