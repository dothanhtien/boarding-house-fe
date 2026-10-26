"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/tables/Pagination";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import { useRooms } from "@/features/rooms/queries";
import { useListPageState } from "@/hooks/useListPageState";
import { PlusIcon } from "@/icons";
import { RoomsGrid } from "./RoomsGrid";

const PAGE_SIZE = 20;

interface RoomsPanelProps {
  propertyId: string;
  canAddRoom: boolean;
}

export const RoomsPanel: React.FC<RoomsPanelProps> = ({
  propertyId,
  canAddRoom,
}) => {
  const { page, search, setSearch, handlePageChange } = useListPageState();
  const router = useRouter();

  const { data, isLoading, isFetching, error } = useRooms({
    propertyId,
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    sortBy: "roomNumber",
    sortOrder: "asc",
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search by room number"
          onSearchChange={setSearch}
        />

        <Button
          size="sm"
          startIcon={<PlusIcon />}
          onClick={() => router.push(ROUTES.createRoom(propertyId))}
          disabled={!canAddRoom}
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
  );
};
