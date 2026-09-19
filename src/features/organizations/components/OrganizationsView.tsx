"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { useOrganizations } from "@/features/organizations/queries";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import { OrganizationsTable } from "@/features/organizations/components/OrganizationsTable";
import { CreateOrganizationModal } from "@/features/organizations/components/CreateOrganizationModal";
import { DeleteOrganizationDialog } from "@/features/organizations/components/DeleteOrganizationDialog";
import { useModal } from "@/hooks/useModal";
import { useListPageState } from "@/hooks/useListPageState";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import type { Organization } from "@/features/organizations/types";

const PAGE_SIZE = 20;

export function OrganizationsView() {
  const {
    page,
    search,
    sortBy,
    sortOrder,
    setSearch,
    handleSortChange,
    handlePageChange,
    handleItemDeleted,
  } = useListPageState();
  const { isOpen, openModal, closeModal } = useModal();
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useOrganizations({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  function handleOrganizationDeleted() {
    handleItemDeleted(data?.items.length ?? 0, refetch);
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Organizations" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              placeholder="Search by name"
              onSearchChange={setSearch}
            />

            <Button size="sm" startIcon={<PlusIcon />} onClick={openModal}>
              Add organization
            </Button>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <OrganizationsTable
            organizations={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onDelete={setDeletingOrg}
          />

          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={(nextPage) =>
                handlePageChange(nextPage, data.totalPages)
              }
            />
          )}
        </div>
      </div>

      <CreateOrganizationModal isOpen={isOpen} onClose={closeModal} />

      {deletingOrg && (
        <DeleteOrganizationDialog
          organization={deletingOrg}
          onClose={() => setDeletingOrg(null)}
          onDeleted={handleOrganizationDeleted}
        />
      )}
    </div>
  );
}
