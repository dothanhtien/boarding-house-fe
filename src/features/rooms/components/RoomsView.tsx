"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import { useProperty } from "@/features/properties/queries";
import { useRooms } from "@/features/rooms/queries";
import { useListPageState } from "@/hooks/useListPageState";
import { ChevronLeftIcon, PlusIcon } from "@/icons";
import { RoomsGrid } from "./RoomsGrid";

const PAGE_SIZE = 20;

interface RoomsViewProps {
  propertyId: string;
}

export function RoomsView({ propertyId }: RoomsViewProps) {
  const { page, search, setSearch, handlePageChange } = useListPageState();
  const router = useRouter();

  const { data: property, error: propertyError } = useProperty(propertyId);
  const { data, isLoading, isFetching, error } = useRooms({
    propertyId,
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    sortBy: "roomNumber",
    sortOrder: "asc",
  });

  return (
    <div>
      <PageBreadcrumb pageTitle={property ? property.name : "Rooms"} />

      <Link
        href={ROUTES.properties}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to properties
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          {propertyError && (
            <p className="text-error-500 text-sm">{propertyError.message}</p>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              placeholder="Search by room number"
              onSearchChange={setSearch}
            />

            <Button
              size="sm"
              startIcon={<PlusIcon />}
              onClick={() => router.push(ROUTES.createRoom(propertyId))}
              disabled={!property}
            >
              Add room
            </Button>
          </div>

          {error && <p className="text-error-500 text-sm">{error.message}</p>}

          <RoomsGrid
            rooms={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
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
    </div>
  );
}
