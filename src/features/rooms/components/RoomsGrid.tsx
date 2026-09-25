import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { ROOM_CATEGORY_IMAGES } from "@/features/rooms/constants";
import { ROUTES } from "@/config/routeDefinition";
import type { Room, RoomAmenity } from "@/features/rooms/types";
import { AmenityIcon } from "./AmenityIcon";
import { RoomStatusIndicator } from "./RoomStatusIndicator";
import { RoomCategoryBadge } from "./RoomCategoryBadge";
import { formatCurrency } from "@/utils/currency";

interface RoomsGridProps {
  rooms: Room[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  emptyMessage?: string;
}

function SkeletonStat({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-1.5 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />

      <div className="mt-5 flex min-h-[106px] items-end justify-between gap-3">
        <div className="flex-1">
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <SkeletonStat className="mt-4" />
        </div>
        <div className="h-20 w-24 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkeletonStat />
        <SkeletonStat />
      </div>

      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  );
}

const MAX_VISIBLE_AMENITIES = 6;

function formatAmenityLabel(amenity: RoomAmenity) {
  return amenity.quantity != null
    ? `${amenity.name} × ${amenity.quantity}`
    : amenity.name;
}

function RoomAmenities({ amenities }: { amenities: RoomAmenity[] }) {
  if (amenities.length === 0) return null;

  const visible = amenities.slice(0, MAX_VISIBLE_AMENITIES);
  const hidden = amenities.slice(MAX_VISIBLE_AMENITIES);

  return (
    <ul className="mt-4 flex flex-wrap items-center gap-1.5">
      {visible.map((amenity) => {
        const label = formatAmenityLabel(amenity);

        return (
          <li key={amenity.id} aria-label={label} className="flex">
            <Tooltip content={label}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400">
                <AmenityIcon icon={amenity.icon} className="h-4 w-4" />
              </span>
            </Tooltip>
          </li>
        );
      })}
      {hidden.length > 0 && (
        <li
          aria-label={hidden.map(formatAmenityLabel).join(", ")}
          className="flex"
        >
          <Tooltip
            content={
              <ul className="space-y-0.5">
                {hidden.map((amenity) => (
                  <li key={amenity.id}>{formatAmenityLabel(amenity)}</li>
                ))}
              </ul>
            }
          >
            <span className="text-theme-xs flex h-8 min-w-8 items-center justify-center rounded-lg bg-gray-100 px-2 font-medium text-gray-600 dark:bg-white/5 dark:text-gray-400">
              +{hidden.length}
            </span>
          </Tooltip>
        </li>
      )}
    </ul>
  );
}

function RoomStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
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
          <Link
            key={room.id}
            href={ROUTES.roomDetail(room.propertyId, room.id)}
            className="hover:border-brand-300 hover:shadow-theme-md focus-visible:ring-brand-500/20 dark:hover:border-brand-800 flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition duration-200 focus-visible:ring-3 focus-visible:outline-hidden dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {room.roomNumber}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <RoomCategoryBadge category={room.roomCategory} />
                {room.floorNumber != null && (
                  <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                    Floor {room.floorNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="relative mt-5 flex min-h-[106px] justify-between">
              <div className="relative z-10">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Monthly rent
                </p>
                <p className="mb-1 text-xl font-medium text-gray-700 dark:text-white/90">
                  {formatCurrency(room.monthlyRent)}
                </p>
                <RoomStatusIndicator
                  status={room.roomStatus}
                  className="mt-4"
                />
                <RoomStat
                  label="Deposit"
                  value={formatCurrency(room.depositAmount)}
                  className="text-theme-xs col-span-2 mt-4"
                />
              </div>
              <Image
                src={ROOM_CATEGORY_IMAGES[room.roomCategory]}
                alt=""
                width={128}
                height={106}
                unoptimized
                className="pointer-events-none absolute -end-5 -bottom-2 rtl:-scale-x-100"
              />
            </div>

            <div className="text-theme-xs mt-4 grid grid-cols-2 gap-3">
              <RoomStat
                label="Area"
                value={room.area != null ? `${room.area} m²` : "—"}
              />
              <RoomStat label="Capacity" value={room.capacity ?? "—"} />
            </div>

            <RoomAmenities amenities={room.amenities} />

            {room.note && (
              <p className="text-theme-xs mt-4 line-clamp-2 text-gray-500 dark:text-gray-400">
                {room.note}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
