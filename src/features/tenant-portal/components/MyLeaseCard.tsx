import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routeDefinition";
import { LeaseStatusBadge } from "@/features/leases/components/LeaseStatusBadge";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import type { MyLease } from "../types";
import { getMovedOutDate } from "../utils";

export const formatLeasePeriod = (
  lease: Pick<MyLease, "startDate" | "endDate">,
) =>
  `${formatDate(lease.startDate, DateFormat.Date)} → ${
    lease.endDate ? formatDate(lease.endDate, DateFormat.Date) : "open-ended"
  }`;

interface MyLeaseCardProps {
  lease: MyLease;
}

export const MyLeaseCard: React.FC<MyLeaseCardProps> = ({ lease }) => {
  const movedOutDate = getMovedOutDate(lease);

  return (
    <li>
      <Link
        href={ROUTES.tenantPortalLeaseDetail(lease.id)}
        className="hover:border-brand-300 dark:hover:border-brand-800 block rounded-2xl border border-gray-200 bg-white p-4 transition sm:p-5 dark:border-gray-800 dark:bg-white/3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {lease.organizationName}
            </p>
            <p className="mt-0.5 font-semibold text-gray-800 dark:text-white/90">
              Room {lease.roomNumber} · {lease.propertyName}
            </p>
            {lease.propertyAddress && (
              <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                {lease.propertyAddress}
              </p>
            )}
          </div>
          <LeaseStatusBadge status={lease.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {formatLeasePeriod(lease)}
          </span>
          <span className="font-medium text-gray-800 tabular-nums dark:text-white/90">
            {formatCurrency(lease.monthlyRent)}
            <span className="font-normal text-gray-500"> / month</span>
          </span>
        </div>

        {movedOutDate && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            You moved out on {formatDate(movedOutDate, DateFormat.Date)}
          </p>
        )}
      </Link>
    </li>
  );
};
