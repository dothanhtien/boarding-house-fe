import React from "react";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import Badge from "@/components/ui/badge/Badge";
import type { Organization, OrganizationMember } from "../types";
import { formatDate } from "@/utils/date";

interface OrganizationMembersCardProps {
  organization: Organization;
}

export const OrganizationMembersCard: React.FC<
  OrganizationMembersCardProps
> = ({ organization }) => {
  const columns: SortableColumn<OrganizationMember>[] = [
    {
      label: "Name",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (member) => member.userFullName,
    },
    { label: "Email", render: (member) => member.userEmail },
    {
      label: "Role",
      render: (member) => (
        <Badge
          size="sm"
          color={
            member.roleName.toLowerCase().includes("admin")
              ? "warning"
              : "primary"
          }
        >
          {member.roleName}
        </Badge>
      ),
    },
    {
      label: "Joined at",
      render: (member) => formatDate(member.createdAt),
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex items-center gap-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Members
        </h4>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {organization.members?.length ?? 0}
        </span>
      </div>

      <SortableDataTable
        columns={columns}
        rows={organization.members ?? []}
        rowKey={(member) => member.id}
        isLoading={false}
        onSortChange={() => {}}
        emptyMessage="No members found."
        minWidthClassName="min-w-[700px]"
      />
    </section>
  );
};
