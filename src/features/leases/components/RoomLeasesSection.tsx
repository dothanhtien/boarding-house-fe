"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import { LeaseOrigin } from "@/features/leases/constants";
import { useLeases } from "@/features/leases/queries";
import { formatLeaseTerm } from "@/features/leases/utils";
import { formatCurrency } from "@/utils/currency";
import { LeaseStatusBadge } from "./LeaseStatusBadge";
import { LeaseTenantsSummary } from "./LeaseTenantsSummary";

const PAGE_SIZE = 10;

const ROW_GRID = "md:grid-cols-[minmax(0,1fr)_220px_140px_96px] md:gap-y-0";

interface RoomLeasesSectionProps {
  roomId: string;
}

export const RoomLeasesSection: React.FC<RoomLeasesSectionProps> = ({
  roomId,
}) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useLeases({
    roomId,
    page,
    pageSize: PAGE_SIZE,
    sortBy: "startDate",
    sortOrder: "desc",
  });
  const leases = data?.items ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Leases
          </h4>
          {data && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({data.totalItems})
            </span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<Plus className="h-4 w-4" aria-hidden />}
          onClick={() => router.push(ROUTES.createLease(roomId))}
        >
          New lease
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}

      {error && <p className="text-error-500 text-sm">{error.message}</p>}

      {data && leases.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No leases.</p>
      )}

      {leases.length > 0 && (
        <div>
          <div
            className={`${ROW_GRID} hidden gap-x-4 px-4 pb-2 text-xs font-medium text-gray-500 md:grid dark:text-gray-400`}
          >
            <span>Lease</span>
            <span>Term</span>
            <span>Monthly rent</span>
            <span>Status</span>
          </div>

          <ul className="flex flex-col gap-3">
            {leases.map((lease) => (
              <li
                key={lease.id}
                className={`${ROW_GRID} grid grid-cols-2 items-center gap-x-4 gap-y-2 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800`}
              >
                <div className="col-span-2 min-w-0 md:col-span-1">
                  <Link
                    href={ROUTES.leaseDetail(lease.id, LeaseOrigin.Room)}
                    className="text-brand-500 hover:text-brand-600 block truncate text-sm font-medium"
                  >
                    {lease.leaseCode}
                  </Link>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    <LeaseTenantsSummary tenants={lease.tenants} />
                  </p>
                </div>
                <p className="col-span-2 text-sm text-gray-800 md:col-span-1 dark:text-white/90">
                  {formatLeaseTerm(lease)}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {formatCurrency(lease.monthlyRent)}
                </p>
                <div>
                  <LeaseStatusBadge status={lease.status} />
                </div>
              </li>
            ))}
          </ul>

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
      )}
    </div>
  );
};
