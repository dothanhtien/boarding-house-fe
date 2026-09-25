"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { ROUTES } from "@/config/routeDefinition";
import { useProperty } from "@/features/properties/queries";
import {
  ROOM_CATEGORY_IMAGES,
  ROOM_CATEGORY_LABELS,
} from "@/features/rooms/constants";
import { useRoom } from "@/features/rooms/queries";
import { SquarePen, Trash2 } from "lucide-react";
import { ChevronLeftIcon } from "@/icons";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { DeleteRoomDialog } from "./DeleteRoomDialog";
import { AmenityIcon } from "./AmenityIcon";
import { RoomStatusIndicator } from "./RoomStatusIndicator";
import { RoomCategoryBadge } from "./RoomCategoryBadge";

interface RoomDetailViewProps {
  propertyId: string;
  roomId: string;
}

export function RoomDetailView({ propertyId, roomId }: RoomDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: property } = useProperty(propertyId);
  const { data: room, isLoading, error } = useRoom(roomId);

  const roomsPath = ROUTES.propertyRooms(propertyId);
  const isRoomInProperty = room?.propertyId === propertyId;

  return (
    <div>
      <PageBreadcrumb
        pageTitle={
          room && isRoomInProperty ? `Room ${room.roomNumber}` : "Room"
        }
      />

      <Link
        href={roomsPath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to {property ? property.name : "rooms"}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        {room && !isRoomInProperty && (
          <p className="text-error-500 text-sm">
            This room does not belong to the selected property.
          </p>
        )}

        {room && isRoomInProperty && (
          <div className="space-y-6">
            <div className="relative rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="relative z-10">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Room {room.roomNumber}
                  </h4>
                  <div className="mt-2 flex items-center gap-2">
                    <RoomCategoryBadge category={room.roomCategory} />
                    {room.floorNumber != null && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Floor {room.floorNumber}
                      </span>
                    )}
                  </div>

                  <p className="mt-5 mb-1 text-3xl font-medium text-gray-800 dark:text-white/90">
                    {formatCurrency(room.monthlyRent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monthly rent
                  </p>

                  <RoomStatusIndicator
                    status={room.roomStatus}
                    className="mt-5"
                  />
                </div>

                <div className="relative z-10 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={ROUTES.editRoom(propertyId, room.id)}
                    className="shadow-theme-xs inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-800 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                  >
                    <SquarePen className="h-4 w-4" aria-hidden />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="shadow-theme-xs bg-error-500 hover:bg-error-600 focus-visible:ring-error-500/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition focus-visible:ring-3 focus-visible:outline-hidden sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>

              <Image
                src={ROOM_CATEGORY_IMAGES[room.roomCategory]}
                alt=""
                width={200}
                height={165}
                unoptimized
                priority
                className="pointer-events-none absolute -end-5 -bottom-2 hidden sm:block lg:-end-6 rtl:-scale-x-100"
              />
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                    Room details
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 xl:grid-cols-3">
                    <InfoItem label="Room number" value={room.roomNumber} />
                    <InfoItem
                      label="Category"
                      value={ROOM_CATEGORY_LABELS[room.roomCategory]}
                    />
                    <InfoItem label="Floor" value={room.floorNumber} />
                    <InfoItem
                      label="Area"
                      value={room.area != null ? `${room.area} m²` : null}
                    />
                    <InfoItem label="Capacity" value={room.capacity} />
                    <InfoItem
                      label="Monthly rent"
                      value={formatCurrency(room.monthlyRent)}
                    />
                    <InfoItem
                      label="Deposit amount"
                      value={formatCurrency(room.depositAmount)}
                    />
                    <InfoItem
                      label="Created at"
                      value={formatDate(room.createdAt)}
                    />
                    <InfoItem
                      label="Updated at"
                      value={formatDate(room.updatedAt)}
                    />
                  </div>

                  <div className="mt-4 lg:mt-7">
                    <InfoItem
                      label="Note"
                      value={
                        room.note && (
                          <span className="whitespace-pre-line">
                            {room.note}
                          </span>
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
              <div className="mb-5 flex items-center gap-3 lg:mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Amenities
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({room.amenities.length})
                </span>
              </div>

              {room.amenities.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No amenities.
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {room.amenities.map((amenity) => {
                    return (
                      <li
                        key={amenity.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800"
                      >
                        <AmenityIcon
                          icon={amenity.icon}
                          className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-white/90">
                          {amenity.name}
                        </span>
                        {amenity.quantity != null && (
                          <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                            × {amenity.quantity}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {room && isDeleting && (
        <DeleteRoomDialog
          room={room}
          onClose={() => setIsDeleting(false)}
          onDeleted={() => router.push(roomsPath)}
        />
      )}
    </div>
  );
}
