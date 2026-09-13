import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import type { User } from "@/features/users/types";
import { formatDate } from "@/utils/date";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  onSortChange: (field: string) => void;
}

interface SortableColumn {
  label: string;
  field?: string;
}

const columns: SortableColumn[] = [
  { label: "Name", field: "fullName" },
  { label: "Email", field: "email" },
  { label: "Phone" },
  { label: "Status" },
  { label: "Last login", field: "lastLoginAt" },
  { label: "Created at", field: "createdAt" },
];

export function UsersTable({
  users,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortDescending,
  onSortChange,
}: UsersTableProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {isFetching && !isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 dark:bg-gray-900/40" />
      )}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.label}
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {col.field ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(col.field!)}
                        className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {col.label}
                        {sortBy === col.field && (
                          <span>{sortDescending ? "↓" : "↑"}</span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell
                    className="text-theme-sm px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    colSpan={columns.length}
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !hasError && users.length === 0 && (
                <TableRow>
                  <TableCell
                    className="text-theme-sm px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    colSpan={columns.length}
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}

              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {user.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={user.isActive ? "success" : "error"}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
