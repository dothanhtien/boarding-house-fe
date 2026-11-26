"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import { ROUTES } from "@/config/routeDefinition";
import { LeaseStatusBadge } from "@/features/leases/components/LeaseStatusBadge";
import {
  UTILITY_BILLING_METHOD_LABELS,
  UTILITY_TYPE_ICONS,
  UtilityBillingMethod,
} from "@/features/utility-services/constants";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { formatMonth } from "@/utils/month";
import {
  useMyInvoices,
  useMyLease,
  useMyLeaseUtilityReadings,
} from "../queries";
import type { MyLeaseDetail, MyStay } from "../types";
import { MyInvoiceCard } from "./MyInvoiceCard";
import { formatLeasePeriod } from "./MyLeaseCard";
import { DetailState } from "./ui/DetailState";
import { InfoItem } from "./ui/InfoItem";
import { PortalList } from "./ui/PortalList";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalPageHeader } from "./ui/PortalPageHeader";
import { PortalSection } from "./ui/PortalSection";

const INVOICES_PREVIEW_SIZE = 5;
const READINGS_PAGE_SIZE = 10;

const linkClassName =
  "text-brand-500 hover:text-brand-600 text-sm font-medium hover:underline";

const formatStay = (stay: MyStay) =>
  `${formatDate(stay.joinedDate, DateFormat.Date)} → ${
    stay.leftDate ? formatDate(stay.leftDate, DateFormat.Date) : "now"
  }`;

const LeaseSummary: React.FC<{ lease: MyLeaseDetail }> = ({ lease }) => (
  <PortalSection>
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      <InfoItem label="Organization">{lease.organizationName}</InfoItem>
      <InfoItem label="Property">{lease.propertyName}</InfoItem>
      {lease.propertyAddress && (
        <InfoItem label="Address">{lease.propertyAddress}</InfoItem>
      )}
      <InfoItem label="Period">{formatLeasePeriod(lease)}</InfoItem>
      <InfoItem label="Monthly rent">
        {formatCurrency(lease.monthlyRent)}
      </InfoItem>
      <InfoItem label="Deposit">{formatCurrency(lease.depositAmount)}</InfoItem>
      {lease.billingDay !== null && (
        <InfoItem label="Billing day">Day {lease.billingDay}</InfoItem>
      )}
      {lease.signedAt && (
        <InfoItem label="Signed">
          {formatDate(lease.signedAt, DateFormat.Date)}
        </InfoItem>
      )}
      {lease.terminatedAt && (
        <InfoItem label="Terminated">
          {formatDate(lease.terminatedAt, DateFormat.Date)}
        </InfoItem>
      )}
    </dl>
  </PortalSection>
);

const StaysSection: React.FC<{ lease: MyLeaseDetail }> = ({ lease }) => (
  <PortalSection title="Your stay">
    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
      {lease.myStays.map((stay) => (
        <li key={stay.joinedDate} className="tabular-nums">
          {formatStay(stay)}
        </li>
      ))}
    </ul>
    {lease.isRepresentative && (
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        You are the representative of this lease.
      </p>
    )}
  </PortalSection>
);

const RoommatesSection: React.FC<{ lease: MyLeaseDetail }> = ({ lease }) => (
  <PortalSection title="People in this lease">
    <ul className="divide-y divide-gray-100 dark:divide-white/5">
      {lease.tenants.map((tenant, index) => (
        <li
          // Roommates come without ids (the backend shares names only).
          key={`${tenant.fullName}-${tenant.joinedDate}-${index}`}
          className={`flex flex-wrap items-center justify-between gap-2 py-2 ${
            tenant.leftDate ? "opacity-60" : ""
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white/90">
            {tenant.fullName}
            {tenant.isRepresentative && (
              <Badge size="sm" color="primary">
                Representative
              </Badge>
            )}
          </span>
          <span className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
            {formatStay(tenant)}
          </span>
        </li>
      ))}
    </ul>
  </PortalSection>
);

const ServicesSection: React.FC<{ lease: MyLeaseDetail }> = ({ lease }) => (
  <PortalSection title="Services">
    {lease.utilityServices.length === 0 ? (
      <PortalMessage>No services are billed for this lease.</PortalMessage>
    ) : (
      <ul className="divide-y divide-gray-100 dark:divide-white/5">
        {lease.utilityServices.map((service) => {
          const Icon = UTILITY_TYPE_ICONS[service.type];
          const showQuantity =
            service.billingMethod === UtilityBillingMethod.Fixed &&
            service.quantity !== 1;
          return (
            <li
              key={service.serviceId}
              className="flex items-center justify-between gap-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {service.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {UTILITY_BILLING_METHOD_LABELS[service.billingMethod]}
                    {showQuantity && ` · × ${service.quantity}`}
                  </span>
                </span>
              </span>
              <span className="text-sm text-gray-700 tabular-nums dark:text-gray-300">
                {formatCurrency(service.unitPrice)} / {service.unit}
              </span>
            </li>
          );
        })}
      </ul>
    )}
  </PortalSection>
);

const ReadingsSection: React.FC<{ leaseId: string }> = ({ leaseId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyLeaseUtilityReadings(leaseId, {
    page,
    pageSize: READINGS_PAGE_SIZE,
  });
  const readings = data?.items ?? [];

  return (
    <PortalSection title="Meter readings">
      {isLoading && <PortalMessage>Loading...</PortalMessage>}
      {error && <PortalMessage tone="error">{error.message}</PortalMessage>}
      {data && readings.length === 0 && (
        <PortalMessage>No meter readings for your stay yet.</PortalMessage>
      )}
      {readings.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-white/5">
          {readings.map((reading) => (
            <li
              key={reading.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {reading.serviceName} · {formatMonth(reading.readingMonth)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Read on {formatDate(reading.readOn, DateFormat.Date)}
                  {reading.invoiceNumber && ` · ${reading.invoiceNumber}`}
                  {reading.imageUrl && (
                    <>
                      {" · "}
                      <a
                        href={reading.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-500 hover:underline"
                      >
                        Photo
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="text-right text-sm tabular-nums">
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {reading.consumption ?? "—"} {reading.unit}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reading.previousValue ?? "—"} → {reading.currentValue}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <div className="mt-3">
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </PortalSection>
  );
};

const InvoicesSection: React.FC<{ leaseId: string }> = ({ leaseId }) => {
  const { data, isLoading, error } = useMyInvoices({
    leaseId,
    pageSize: INVOICES_PREVIEW_SIZE,
  });
  const invoices = data?.items ?? [];

  return (
    <PortalSection
      title="Invoices"
      action={
        data && data.totalItems > INVOICES_PREVIEW_SIZE ? (
          <Link
            href={ROUTES.tenantPortalInvoices({ leaseId })}
            className={linkClassName}
          >
            View all
          </Link>
        ) : undefined
      }
    >
      {isLoading && <PortalMessage>Loading...</PortalMessage>}
      {error && <PortalMessage tone="error">{error.message}</PortalMessage>}
      {data && invoices.length === 0 && (
        <PortalMessage>No invoices for your stay yet.</PortalMessage>
      )}
      {invoices.length > 0 && (
        <PortalList>
          {invoices.map((invoice) => (
            <MyInvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </PortalList>
      )}
    </PortalSection>
  );
};

interface MyLeaseDetailViewProps {
  leaseId: string;
}

export const MyLeaseDetailView: React.FC<MyLeaseDetailViewProps> = ({
  leaseId,
}) => {
  const { data: lease, isLoading, error } = useMyLease(leaseId);

  return (
    <div>
      <PortalPageHeader
        backHref={ROUTES.tenantPortalLeases}
        backLabel="Back to leases"
        title={lease ? `Room ${lease.roomNumber}` : "Lease"}
        subtitle={lease?.leaseCode}
        aside={lease && <LeaseStatusBadge status={lease.status} />}
      />

      <DetailState
        isLoading={isLoading}
        error={error}
        notFoundMessage="This lease doesn't exist or isn't yours."
      />

      {lease && (
        <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-3">
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <LeaseSummary lease={lease} />
            <InvoicesSection leaseId={lease.id} />
            <ReadingsSection leaseId={lease.id} />
          </div>
          <div className="space-y-4 md:space-y-6">
            <StaysSection lease={lease} />
            <ServicesSection lease={lease} />
            <RoommatesSection lease={lease} />
          </div>
        </div>
      )}
    </div>
  );
};
