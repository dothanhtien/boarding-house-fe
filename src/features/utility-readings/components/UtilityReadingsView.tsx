"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import { ROUTES } from "@/config/routeDefinition";
import { usePropertyLookup } from "@/features/properties/queries";
import { useUtilityReadingRooms } from "@/features/utility-readings/queries";
import {
  getDefaultReadingMonth,
  isSelectableReadingMonth,
} from "@/features/utility-readings/utils";
import { toBillingMonth } from "@/utils/month";
import { useListPageState } from "@/hooks/useListPageState";
import { ReadingMonthSelect } from "./ReadingMonthSelect";
import { RoomReadingsModal } from "./RoomReadingsModal";
import { RoomReadingTile, RoomReadingTileSkeleton } from "./RoomReadingTile";

const PAGE_SIZE = 40;

const GRID_CLASSES = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";

interface UtilityReadingsViewProps {
  initialPropertyId?: string;
  initialMonth?: string;
}

const EmptyMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
    {children}
  </div>
);

const RoomsSkeleton: React.FC = () => (
  <div className={GRID_CLASSES}>
    {Array.from({ length: 12 }).map((_, index) => (
      <RoomReadingTileSkeleton key={index} />
    ))}
  </div>
);

export const UtilityReadingsView: React.FC<UtilityReadingsViewProps> = ({
  initialPropertyId,
  initialMonth,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialPropertyId ?? "",
  );
  const [month, setMonth] = useState(() =>
    initialMonth && isSelectableReadingMonth(initialMonth)
      ? initialMonth
      : getDefaultReadingMonth(),
  );
  const [readOn, setReadOn] = useState("");
  const [onlyNotDone, setOnlyNotDone] = useState(false);
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const { page, search, setSearch, handlePageChange, resetPage } =
    useListPageState();

  const {
    data: propertiesData,
    isFetching: isFetchingProperties,
    error: propertiesError,
    refetch: refetchProperties,
  } = usePropertyLookup();
  const properties = propertiesData ?? [];
  const hasProperties = propertiesData !== undefined;

  const propertyId = properties.some(
    (property) => property.id === selectedPropertyId,
  )
    ? selectedPropertyId
    : (properties[0]?.id ?? "");
  const readingMonth = toBillingMonth(month);

  const { data, isLoading, isPlaceholderData, error } = useUtilityReadingRooms(
    propertyId,
    {
      readingMonth,
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      recorded: onlyNotDone ? false : undefined,
    },
  );
  const rooms = data?.items ?? [];

  useEffect(() => {
    if (!hasProperties) return;
    window.history.replaceState(
      null,
      "",
      ROUTES.utilityReadings({ propertyId, month }),
    );
  }, [hasProperties, propertyId, month]);

  const renderContent = () => {
    if (!hasProperties && propertiesError) {
      return (
        <div className="flex flex-col items-start gap-3">
          <p className="text-error-500 text-sm">{propertiesError.message}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isFetchingProperties}
            onClick={() => refetchProperties()}
          >
            {isFetchingProperties ? "Retrying..." : "Try again"}
          </Button>
        </div>
      );
    }
    if (!hasProperties) return <RoomsSkeleton />;
    if (!propertyId) {
      return (
        <EmptyMessage>
          {properties.length === 0
            ? "There are no properties yet."
            : "Select a property to start recording meter readings."}
        </EmptyMessage>
      );
    }
    if (error) return <p className="text-error-500 text-sm">{error.message}</p>;
    if (isLoading || !data) return <RoomsSkeleton />;
    if (rooms.length === 0) {
      return (
        <EmptyMessage>
          {search
            ? "No rooms match your search."
            : onlyNotDone
              ? "Every room is done for this month."
              : "This property has no rooms yet."}
        </EmptyMessage>
      );
    }

    return (
      <div className="relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 z-10 bg-white/40 dark:bg-gray-900/40" />
        )}
        <div className={GRID_CLASSES} inert={isPlaceholderData}>
          {rooms.map((room) => (
            <RoomReadingTile
              key={room.roomId}
              room={room}
              onClick={() => {
                if (!isPlaceholderData) setOpenRoomId(room.roomId);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Meter readings" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
            <div>
              <Label htmlFor="readingProperty">Property</Label>
              <Select
                id="readingProperty"
                options={properties.map((property) => ({
                  value: property.id,
                  label: property.name,
                }))}
                placeholder="Select property"
                value={propertyId}
                onChange={(value) => {
                  setSelectedPropertyId(value);
                  resetPage();
                }}
              />
            </div>
            <div>
              <Label htmlFor="readingMonth">Billing month</Label>
              <ReadingMonthSelect
                id="readingMonth"
                value={month}
                onChange={(value) => {
                  setMonth(value);
                  setReadOn("");
                  resetPage();
                }}
              />
            </div>
          </div>

          {propertyId && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <SearchInput
                placeholder="Search by room number"
                onSearchChange={setSearch}
              />
              <Checkbox
                id="onlyNotDone"
                label="Only rooms not done yet"
                checked={onlyNotDone}
                onChange={(checked) => {
                  setOnlyNotDone(checked);
                  resetPage();
                }}
              />
            </div>
          )}

          {renderContent()}

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

      {openRoomId && (
        <RoomReadingsModal
          key={`${openRoomId}:${readingMonth}`}
          roomId={openRoomId}
          readingMonth={readingMonth}
          readOn={readOn}
          onReadOnChange={setReadOn}
          onClose={() => setOpenRoomId(null)}
        />
      )}
    </div>
  );
};
