import React from "react";
import Link from "next/link";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import Badge from "@/components/ui/badge/Badge";
import type { Organization } from "@/features/organizations/types";
import { formatDate } from "@/utils/date";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface OrganizationsTableProps {
  organizations: Organization[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  onDelete: (organization: Organization) => void;
}

function formatAddress(org: Organization) {
  return (
    [org.address, org.ward, org.district, org.province]
      .filter(Boolean)
      .join(", ") || "—"
  );
}

export function OrganizationsTable({
  organizations,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: OrganizationsTableProps) {
  const columns: SortableColumn<Organization>[] = [
    {
      label: "Name",
      field: "name",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (org) => org.name,
    },
    { label: "Phone", render: (org) => (org.phone ? org.phone : "—") },
    {
      label: "Email",
      field: "email",
      render: (org) => (org.email ? org.email : "—"),
    },
    { label: "Address", render: formatAddress },
    {
      label: "Status",
      render: (org) => (
        <Badge size="sm" color={org.isActive ? "success" : "error"}>
          {org.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      label: "Created at",
      field: "createdAt",
      render: (org) => formatDate(org.createdAt),
    },
    {
      label: "Actions",
      render: (org) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/organizations/${org.id}`}
            aria-label="Edit organization"
            className="hover:text-brand-500 dark:hover:text-brand-500 cursor-pointer text-gray-700 dark:text-gray-400"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label="Delete organization"
            onClick={() => onDelete(org)}
            className="hover:text-error-500 dark:hover:text-error-500 cursor-pointer text-gray-700 dark:text-gray-400"
          >
            <TrashBinIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <SortableDataTable
      columns={columns}
      rows={organizations}
      rowKey={(org) => org.id}
      isLoading={isLoading}
      isFetching={isFetching}
      hasError={hasError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      emptyMessage="No organizations found."
      minWidthClassName="min-w-[1000px]"
    />
  );
}
