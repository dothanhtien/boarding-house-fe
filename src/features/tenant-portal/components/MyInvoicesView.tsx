"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceMonthSelect } from "@/features/invoices/components/InvoiceMonthSelect";
import {
  INVOICE_STATUS_OPTIONS,
  type InvoiceStatus,
} from "@/features/invoices/constants";
import { toBillingMonth } from "@/utils/month";
import { useMyInvoices } from "../queries";
import { MyInvoiceCard } from "./MyInvoiceCard";
import { PortalList } from "./ui/PortalList";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalPageHeader } from "./ui/PortalPageHeader";

const PAGE_SIZE = 10;

export const MyInvoicesView: React.FC = () => {
  const leaseId = useSearchParams().get("leaseId") ?? undefined;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [month, setMonth] = useState("");
  const { data, isLoading, error } = useMyInvoices({
    page,
    pageSize: PAGE_SIZE,
    leaseId,
    status: status || undefined,
    billingMonth: month ? toBillingMonth(month) : undefined,
  });
  const invoices = data?.items ?? [];
  const hasFilters = !!(status || month || leaseId);

  return (
    <div>
      <PortalPageHeader title="Invoices" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-48">
          <Label htmlFor="myInvoiceStatusFilter" className="sr-only">
            Status
          </Label>
          <Select
            id="myInvoiceStatusFilter"
            options={INVOICE_STATUS_OPTIONS}
            placeholder="Not cancelled"
            value={status}
            onChange={(value) => {
              setStatus(value as InvoiceStatus | "");
              setPage(1);
            }}
          />
        </div>
        <div className="sm:w-40">
          <Label htmlFor="myInvoiceMonthFilter" className="sr-only">
            Month
          </Label>
          <InvoiceMonthSelect
            id="myInvoiceMonthFilter"
            value={month}
            allowEmpty
            placeholder="All months"
            lookback={24}
            onChange={(value) => {
              setMonth(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {leaseId && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing invoices of one lease.{" "}
          <Link
            href={ROUTES.tenantPortalInvoices()}
            className="text-brand-500 hover:text-brand-600 font-medium hover:underline"
          >
            Show all
          </Link>
        </p>
      )}

      {isLoading && <PortalMessage>Loading...</PortalMessage>}
      {error && <PortalMessage tone="error">{error.message}</PortalMessage>}
      {data && invoices.length === 0 && (
        <PortalMessage>
          {hasFilters
            ? "No invoices match these filters."
            : "You have no invoices yet."}
        </PortalMessage>
      )}

      {invoices.length > 0 && (
        <PortalList>
          {invoices.map((invoice) => (
            <MyInvoiceCard key={invoice.id} invoice={invoice} />
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
