"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DatePicker from "@/components/form/DatePicker";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type PaymentMethod,
  type PaymentStatus,
} from "@/features/payments/constants";
import { usePayments } from "@/features/payments/queries";
import { isDateRangeValid } from "@/features/payments/utils";
import { usePropertyLookup } from "@/features/properties/queries";
import { useListPageState } from "@/hooks/useListPageState";
import { PaymentsTable } from "./PaymentsTable";

const PAGE_SIZE = 20;

export const PaymentsView: React.FC = () => {
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
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const isRangeValid = isDateRangeValid(from, to);

  const { data: properties = [] } = usePropertyLookup();
  const { data, isLoading, isFetching, error } = usePayments(
    {
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      propertyId: propertyId || undefined,
      method: method || undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      sortBy,
      sortOrder,
    },
    { enabled: isRangeValid },
  );
  const payments = data?.items ?? [];

  const hasFilters = !!(propertyId || method || status || from || to || search);

  const changeFilter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      resetPage();
    };

  return (
    <div>
      <PageBreadcrumb pageTitle="Payments" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start">
            <SearchInput
              placeholder="Search by invoice #, lease code or reference"
              onSearchChange={setSearch}
            />
            <Label htmlFor="paymentPropertyFilter" className="sr-only">
              Property
            </Label>
            <Select
              id="paymentPropertyFilter"
              className="lg:w-52"
              options={properties.map((property) => ({
                value: property.id,
                label: property.name,
              }))}
              placeholder="All properties"
              value={propertyId}
              onChange={changeFilter(setPropertyId)}
            />
            <Label htmlFor="paymentMethodFilter" className="sr-only">
              Method
            </Label>
            <Select
              id="paymentMethodFilter"
              className="lg:w-40"
              options={PAYMENT_METHOD_OPTIONS}
              placeholder="All methods"
              value={method}
              onChange={changeFilter((value: string) =>
                setMethod(value as PaymentMethod | ""),
              )}
            />
            <Label htmlFor="paymentStatusFilter" className="sr-only">
              Status
            </Label>
            <Select
              id="paymentStatusFilter"
              className="lg:w-40"
              options={PAYMENT_STATUS_OPTIONS}
              placeholder="All statuses"
              value={status}
              onChange={changeFilter((value: string) =>
                setStatus(value as PaymentStatus | ""),
              )}
            />
            <div className="flex gap-3 lg:w-[22rem]">
              <div className="flex-1">
                <DatePicker
                  id="paymentFrom"
                  placeholder="From"
                  value={from}
                  clearable
                  onChange={(_, dateStr) => changeFilter(setFrom)(dateStr)}
                />
              </div>
              <div className="flex-1">
                <DatePicker
                  id="paymentTo"
                  placeholder="To"
                  value={to}
                  clearable
                  error={!isRangeValid}
                  hint={isRangeValid ? undefined : "Must be on or after From"}
                  onChange={(_, dateStr) => changeFilter(setTo)(dateStr)}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <PaymentsTable
            payments={isRangeValid ? payments : []}
            isLoading={isLoading && isRangeValid}
            isFetching={isFetching}
            hasError={!!error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            emptyMessage={
              !isRangeValid
                ? "Fix the date range to see payments."
                : hasFilters
                  ? "No payments match these filters."
                  : "No payments yet."
            }
          />

          {isRangeValid && data && data.totalPages > 1 && (
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
