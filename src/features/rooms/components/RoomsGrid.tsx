import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  ROOM_CATEGORY_LABELS,
  ROOM_STATUS_BADGE_COLORS,
  ROOM_STATUS_LABELS,
} from "@/features/rooms/constants";
import type { Room } from "@/features/rooms/types";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface RoomsGridProps {
  rooms: Room[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  emptyMessage?: string;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

function formatAmount(value: number | null) {
  return value == null ? "—" : value.toLocaleString();
}

function RoomCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-3 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function RoomStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-gray-700 dark:text-gray-300">{value}</p>
    </div>
  );
}

export function RoomsGrid({
  rooms,
  isLoading,
  isFetching = false,
  hasError = false,
  emptyMessage = "No rooms found.",
  onEdit,
  onDelete,
}: RoomsGridProps) {
  if (isLoading && rooms.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <RoomCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!isLoading && !hasError && rooms.length === 0) {
    return (
      <div className="text-theme-sm rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && !isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 dark:bg-gray-900/40" />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {room.roomNumber}
                </h3>
                <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-400">
                  {ROOM_CATEGORY_LABELS[room.roomCategory]}
                  {room.floorNumber != null && ` · Floor ${room.floorNumber}`}
                </p>
              </div>
              <Badge
                size="sm"
                color={ROOM_STATUS_BADGE_COLORS[room.roomStatus]}
              >
                {ROOM_STATUS_LABELS[room.roomStatus]}
              </Badge>
            </div>

            <div className="text-theme-xs mt-4 grid grid-cols-2 gap-3">
              <RoomStat
                label="Monthly rent"
                value={formatAmount(room.monthlyRent)}
              />
              <RoomStat
                label="Deposit"
                value={formatAmount(room.depositAmount)}
              />
              <RoomStat
                label="Area"
                value={room.area != null ? `${room.area} m²` : "—"}
              />
              <RoomStat label="Capacity" value={room.capacity ?? "—"} />
            </div>

            {room.note && (
              <p className="text-theme-xs mt-4 line-clamp-2 text-gray-500 dark:text-gray-400">
                {room.note}
              </p>
            )}

            <div className="mt-auto flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                aria-label="Edit room"
                onClick={() => onEdit(room)}
                className="hover:text-brand-500 dark:hover:text-brand-500 cursor-pointer text-gray-700 dark:text-gray-400"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Delete room"
                onClick={() => onDelete(room)}
                className="hover:text-error-500 dark:hover:text-error-500 cursor-pointer text-gray-700 dark:text-gray-400"
              >
                <TrashBinIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
