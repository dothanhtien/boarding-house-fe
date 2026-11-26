"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routeDefinition";
import { LeaseStatus } from "@/features/leases/constants";
import { getUtcToday } from "@/utils/date";
import { useMyInvoices, useMyLeases, useTenancy } from "../queries";
import { isInvoiceUnpaid, isStayingNow } from "../utils";
import { MyInvoiceCard } from "./MyInvoiceCard";
import { MyLeaseCard } from "./MyLeaseCard";
import { PortalList } from "./ui/PortalList";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalPageHeader } from "./ui/PortalPageHeader";
import { PortalSection } from "./ui/PortalSection";

const OVERVIEW_PAGE_SIZE = 50;
const MAX_UNPAID_INVOICES = 5;

const linkClassName =
  "text-brand-500 hover:text-brand-600 text-sm font-medium hover:underline";

export const MyOverviewView: React.FC = () => {
  const today = getUtcToday();
  const { data: tenancy } = useTenancy();
  const hasActiveLease = (tenancy?.activeLeaseCount ?? 0) > 0;

  const leasesQuery = useMyLeases(
    { status: LeaseStatus.Active, pageSize: OVERVIEW_PAGE_SIZE },
    { enabled: hasActiveLease },
  );
  const currentLeases = (leasesQuery.data?.items ?? []).filter((lease) =>
    isStayingNow(lease, today),
  );

  const invoicesQuery = useMyInvoices({ pageSize: OVERVIEW_PAGE_SIZE });
  const unpaidInvoices = (invoicesQuery.data?.items ?? []).filter(
    isInvoiceUnpaid,
  );

  const renderLeases = () => {
    if (!hasActiveLease || (leasesQuery.data && currentLeases.length === 0)) {
      return (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have no active rental.
          </p>
          <Link href={ROUTES.tenantPortalLeases} className={linkClassName}>
            See your past leases
          </Link>
        </div>
      );
    }
    if (leasesQuery.isLoading) return <PortalMessage>Loading...</PortalMessage>;
    if (leasesQuery.error) {
      return (
        <PortalMessage tone="error">{leasesQuery.error.message}</PortalMessage>
      );
    }
    return (
      <PortalList>
        {currentLeases.map((lease) => (
          <MyLeaseCard key={lease.id} lease={lease} />
        ))}
      </PortalList>
    );
  };

  const renderInvoices = () => {
    if (invoicesQuery.isLoading) {
      return <PortalMessage>Loading...</PortalMessage>;
    }
    if (invoicesQuery.error) {
      return (
        <PortalMessage tone="error">
          {invoicesQuery.error.message}
        </PortalMessage>
      );
    }
    if (unpaidInvoices.length === 0) {
      return <PortalMessage>You&apos;re all paid up.</PortalMessage>;
    }
    return (
      <PortalList>
        {unpaidInvoices.slice(0, MAX_UNPAID_INVOICES).map((invoice) => (
          <MyInvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </PortalList>
    );
  };

  return (
    <div>
      <PortalPageHeader title="My rentals" />

      <div className="space-y-4 md:space-y-6">
        <PortalSection
          title="Invoices to pay"
          action={
            <Link
              href={ROUTES.tenantPortalInvoices()}
              className={linkClassName}
            >
              View all
            </Link>
          }
        >
          {renderInvoices()}
        </PortalSection>

        <PortalSection title="Where you live">{renderLeases()}</PortalSection>
      </div>
    </div>
  );
};
