"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { useProperties } from "@/features/properties/queries";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import { PropertiesGrid } from "@/features/properties/components/PropertiesGrid";
import { CreatePropertyModal } from "@/features/properties/components/CreatePropertyModal";
import { EditPropertyModal } from "@/features/properties/components/EditPropertyModal";
import { DeletePropertyDialog } from "@/features/properties/components/DeletePropertyDialog";
import { useListPageState } from "@/hooks/useListPageState";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import type { Property } from "@/features/properties/types";

const PAGE_SIZE = 20;

export function PropertiesView() {
  const { page, search, setSearch, handlePageChange, handleItemDeleted } =
    useListPageState();
  const { isOpen, openModal, closeModal } = useModal();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(
    null,
  );

  const { data, isLoading, isFetching, error, refetch } = useProperties({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  function handlePropertyDeleted() {
    handleItemDeleted(data?.items.length ?? 0, refetch);
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Properties" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              placeholder="Search by name"
              onSearchChange={setSearch}
            />

            <Button size="sm" startIcon={<PlusIcon />} onClick={openModal}>
              Add property
            </Button>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <PropertiesGrid
            properties={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
            onEdit={setEditingProperty}
            onDelete={setDeletingProperty}
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

      <CreatePropertyModal isOpen={isOpen} onClose={closeModal} />

      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          isOpen
          onClose={() => setEditingProperty(null)}
        />
      )}

      {deletingProperty && (
        <DeletePropertyDialog
          property={deletingProperty}
          onClose={() => setDeletingProperty(null)}
          onDeleted={handlePropertyDeleted}
        />
      )}
    </div>
  );
}
