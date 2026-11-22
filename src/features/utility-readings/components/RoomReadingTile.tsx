import React from "react";
import { CircleCheck } from "lucide-react";
import { UtilityReadingRoomStatus } from "@/features/utility-readings/constants";
import type { UtilityReadingRoomListItem } from "@/features/utility-readings/types";
import { isRoomDone } from "@/features/utility-readings/utils";

interface RoomReadingTileProps {
  room: UtilityReadingRoomListItem;
  onClick: () => void;
}

const STATUS_LABELS: Record<UtilityReadingRoomStatus, string> = {
  [UtilityReadingRoomStatus.Pending]: "Not recorded",
  [UtilityReadingRoomStatus.Partial]: "Partly recorded",
  [UtilityReadingRoomStatus.Recorded]: "Recorded",
  [UtilityReadingRoomStatus.NoMeters]: "No meters",
};

export const RoomReadingTileSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
    <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mt-4 h-1.5 w-full rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mt-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

export const RoomReadingTile: React.FC<RoomReadingTileProps> = ({
  room,
  onClick,
}) => {
  const isDone = isRoomDone(room);
  const progress =
    room.meterCount === 0 ? 0 : (room.recordedCount / room.meterCount) * 100;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`hover:shadow-theme-md flex w-full cursor-pointer flex-col gap-3 rounded-xl border p-4 text-start transition duration-200 focus-visible:ring-3 focus-visible:outline-hidden ${
        isDone
          ? "border-success-300 bg-success-50/50 hover:border-success-400 focus-visible:ring-success-500/20 dark:border-success-500/30 dark:bg-success-500/5"
          : "hover:border-brand-300 focus-visible:ring-brand-500/20 dark:hover:border-brand-800 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {room.roomNumber}
          </h3>
          <p className="text-theme-xs truncate text-gray-500 dark:text-gray-400">
            {room.lease?.leaseCode ?? "Vacant"}
          </p>
        </div>
        {isDone ? (
          <CircleCheck
            className="text-success-500 h-5 w-5 shrink-0"
            aria-label="Done"
          />
        ) : (
          <span className="text-theme-xs shrink-0 font-medium text-gray-500 dark:text-gray-400">
            {room.recordedCount}/{room.meterCount}
          </span>
        )}
      </div>

      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="bg-success-500 h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p
          className={`text-theme-xs mt-1.5 ${
            isDone
              ? "text-success-600 dark:text-success-500 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {STATUS_LABELS[room.status]}
        </p>
      </div>
    </button>
  );
};
