import React from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { ROUTES } from "@/config/routeDefinition";
import { RoomStatusIndicator } from "@/features/rooms/components/RoomStatusIndicator";
import type { UtilityReadingRoomMeters } from "@/features/utility-readings/types";
import { formatUnitPrice } from "@/features/utility-services/utils";
import { formatCurrency } from "@/utils/currency";

interface RoomReadingsSummaryProps {
  room: UtilityReadingRoomMeters;
}

const OtherChargesTooltip: React.FC<{ room: UtilityReadingRoomMeters }> = ({
  room,
}) => (
  <Tooltip
    placement="right"
    content={
      <div className="space-y-1">
        <p className="font-semibold">Other monthly charges</p>
        {room.otherCharges.map((charge) => (
          <p key={charge.serviceId}>
            {charge.serviceName}: {charge.quantity} ×{" "}
            {formatUnitPrice(charge.unitPrice, charge.unit)} ={" "}
            {formatCurrency(charge.amount)}
          </p>
        ))}
      </div>
    }
  >
    <button
      type="button"
      aria-label={`Other charges of room ${room.roomNumber}`}
      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
    >
      <Info className="h-4 w-4" aria-hidden />
    </button>
  </Tooltip>
);

export const RoomReadingsSummary: React.FC<RoomReadingsSummaryProps> = ({
  room,
}) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    <div className="flex items-center gap-1.5">
      <span className="text-base font-semibold text-gray-800 dark:text-white/90">
        {room.roomNumber}
      </span>
      {room.otherCharges.length > 0 && <OtherChargesTooltip room={room} />}
    </div>
    <RoomStatusIndicator status={room.roomStatus} />
    {room.lease ? (
      <Link
        href={ROUTES.leaseDetail(room.lease.leaseId)}
        className="text-brand-500 hover:text-brand-600 block text-xs font-medium"
      >
        {room.lease.leaseCode}
      </Link>
    ) : (
      <Badge size="sm" color="warning">
        Vacant · owner pays
      </Badge>
    )}
  </div>
);
