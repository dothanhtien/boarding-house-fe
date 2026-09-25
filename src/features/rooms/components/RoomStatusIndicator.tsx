import React from "react";
import {
  ROOM_STATUS_INDICATOR_CLASSES,
  ROOM_STATUS_LABELS,
} from "@/features/rooms/constants";
import type { RoomStatus } from "@/features/rooms/types";

interface RoomStatusIndicatorProps {
  status: RoomStatus;
  className?: string;
}

export const RoomStatusIndicator: React.FC<RoomStatusIndicatorProps> = ({
  status,
  className = "",
}) => {
  const classes = ROOM_STATUS_INDICATOR_CLASSES[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-inset ${classes.ring}`}
      >
        <div className={`h-2.5 w-2.5 rounded-full ${classes.dot}`} />
      </div>
      <span className={`text-sm font-medium ${classes.text}`}>
        {ROOM_STATUS_LABELS[status]}
      </span>
    </div>
  );
};
