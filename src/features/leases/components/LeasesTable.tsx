import React from "react";
import Link from "next/link";
import { SquarePen, Trash2 } from "lucide-react";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import { ROUTES } from "@/config/routeDefinition";
import type { Lease } from "@/features/leases/types";
import { formatLeaseTerm, isLeaseEditable } from "@/features/leases/utils";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { LeaseStatusBadge } from "./LeaseStatusBadge";
import { LeaseTenantsSummary } from "./LeaseTenantsSummary";
import { PropertyLookupItem } from "@/features/properties/types";

interface LeasesTableProps {
  leases: Lease[];
  properties: PropertyLookupItem[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  onDelete: (lease: Lease) => void;
}

const actionClassName =
  "flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400";

export function LeasesTable({
  leases,
  properties,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: LeasesTableProps) {
  const columns: SortableColumn<Lease>[] = [
    {
      label: "Lease code",
      field: "leaseCode",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (lease) => (
        <Link
          href={ROUTES.leaseDetail(lease.id)}
          className="text-brand-500 hover:text-brand-600"
        >
          {lease.leaseCode}
        </Link>
      ),
    },
    {
      label: "Room",
      render: (lease) => {
        const foundProperty = properties.find((p) => p.id === lease.propertyId);

        return (
          <div>
            <p className="text-gray-800 dark:text-white/90">
              Room {lease.roomNumber}
            </p>
            {foundProperty && (
              <p className="text-theme-xs">{foundProperty.name}</p>
            )}
          </div>
        );
      },
    },
    {
      label: "Tenants",
      render: (lease) => <LeaseTenantsSummary tenants={lease.tenants} />,
    },
    {
      label: "Term",
      field: "startDate",
      render: (lease) => formatLeaseTerm(lease),
    },
    {
      label: "Monthly rent",
      render: (lease) => formatCurrency(lease.monthlyRent),
    },
    {
      label: "Status",
      render: (lease) => <LeaseStatusBadge status={lease.status} />,
    },
    {
      label: "Created at",
      field: "createdAt",
      render: (lease) => formatDate(lease.createdAt),
    },
    {
      label: "Actions",
      render: (lease) => {
        const editable = isLeaseEditable(lease);
        const disabledTitle = "Only draft leases can be changed";

        return (
          <div className="flex items-center gap-1">
            {editable ? (
              <Link
                href={ROUTES.editLease(lease.id)}
                aria-label={`Edit lease ${lease.leaseCode}`}
                className={`${actionClassName} hover:text-brand-500 dark:hover:text-brand-500`}
              >
                <SquarePen className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-label={`Edit lease ${lease.leaseCode}`}
                title={disabledTitle}
                className={actionClassName}
              >
                <SquarePen className="h-4 w-4" aria-hidden />
              </button>
            )}
            <button
              type="button"
              disabled={!editable}
              aria-label={`Delete lease ${lease.leaseCode}`}
              title={editable ? undefined : disabledTitle}
              onClick={() => onDelete(lease)}
              className={`${actionClassName} hover:text-error-500 dark:hover:text-error-500 cursor-pointer disabled:hover:text-gray-700 dark:disabled:hover:text-gray-400`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <SortableDataTable
      columns={columns}
      rows={leases}
      rowKey={(lease) => lease.id}
      isLoading={isLoading}
      isFetching={isFetching}
      hasError={hasError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      emptyMessage="No leases found."
      minWidthClassName="min-w-[1000px]"
    />
  );
}
