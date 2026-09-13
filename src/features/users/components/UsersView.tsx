"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { useUsers } from "@/features/users/queries";
import { UsersFilter } from "@/features/users/components/UsersFilter";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { CreateUserModal } from "./CreateUserModal";

const PAGE_SIZE = 20;

export function UsersView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDescending, setSortDescending] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  function handleSortChange(field: string) {
    if (sortBy === field) {
      setSortDescending((prev) => !prev);
    } else {
      setSortBy(field);
      setSortDescending(false);
    }
    setPage(1);
  }

  const { data, isLoading, isFetching, error } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    sortBy,
    sortDescending,
  });

  function handlePageChange(nextPage: number) {
    const totalPages = data?.totalPages ?? 1;
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Users" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <UsersFilter
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />

            <Button size="sm" startIcon={<PlusIcon />} onClick={openModal}>
              Add user
            </Button>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <UsersTable
            users={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
            sortBy={sortBy}
            sortDescending={sortDescending}
            onSortChange={handleSortChange}
          />

          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <CreateUserModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}
