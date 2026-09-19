import React from "react";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import Badge from "@/components/ui/badge/Badge";
import type { User } from "@/features/users/types";
import { formatDate } from "@/utils/date";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserId?: string;
}

export function UsersTable({
  users,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  currentUserId,
}: UsersTableProps) {
  const columns: SortableColumn<User>[] = [
    {
      label: "Name",
      field: "fullName",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (user) => user.fullName,
    },
    { label: "Email", field: "email", render: (user) => user.email },
    { label: "Phone", render: (user) => (user.phone ? user.phone : "—") },
    {
      label: "Status",
      render: (user) => (
        <Badge size="sm" color={user.isActive ? "success" : "error"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      label: "Last login",
      field: "lastLoginAt",
      render: (user) => formatDate(user.lastLoginAt),
    },
    {
      label: "Created at",
      field: "createdAt",
      render: (user) => formatDate(user.createdAt),
    },
    {
      label: "Actions",
      render: (user) => {
        const isCurrentUserLoaded = currentUserId !== undefined;
        const isSelf = user.id === currentUserId;
        const isDisabled = !isCurrentUserLoaded || isSelf;

        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Edit user"
              title={
                !isCurrentUserLoaded
                  ? "Loading current user..."
                  : isSelf
                    ? "You cannot edit your own account"
                    : undefined
              }
              disabled={isDisabled}
              onClick={() => onEdit(user)}
              className="hover:text-brand-500 dark:hover:text-brand-500 cursor-pointer text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-700 dark:text-gray-400 dark:disabled:hover:text-gray-400"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Delete user"
              title={
                !isCurrentUserLoaded
                  ? "Loading current user..."
                  : isSelf
                    ? "You cannot delete your own account"
                    : undefined
              }
              disabled={isDisabled}
              onClick={() => onDelete(user)}
              className="hover:text-error-500 dark:hover:text-error-500 cursor-pointer text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-700 dark:text-gray-400 dark:disabled:hover:text-gray-400"
            >
              <TrashBinIcon className="h-5 w-5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <SortableDataTable
      columns={columns}
      rows={users}
      rowKey={(user) => user.id}
      isLoading={isLoading}
      isFetching={isFetching}
      hasError={hasError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      emptyMessage="No users found."
      minWidthClassName="min-w-[900px]"
    />
  );
}
