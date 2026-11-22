import type { ListQueryParams, PagedResult } from "@/types";
import type { LeaseStatus } from "@/features/leases/constants";
import type { RoomStatus } from "@/features/rooms/types";
import type { UtilityBillingMethod } from "@/features/utility-services/constants";
import type { UtilityReadingRoomStatus } from "./constants";

export type UtilityReading = {
  id: string;
  roomId: string;
  serviceId: string;
  serviceName: string;
  unit: string;
  readOn: string;
  readingMonth: string;
  billedLeaseId: string | null;
  billedLeaseCode: string | null;
  previousValue: number | null;
  currentValue: number;
  consumption: number | null;
  imageUrl: string | null;
  createdAt: string;
  createdBy: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
};

export type UtilityReadingSummary = Pick<
  UtilityReading,
  "id" | "readOn" | "readingMonth" | "currentValue"
>;

export type UtilityReadingRoomLease = {
  leaseId: string;
  leaseCode: string;
  status: LeaseStatus;
};

export type UtilityReadingRoomListItem = {
  roomId: string;
  roomNumber: string;
  roomStatus: RoomStatus;
  lease: UtilityReadingRoomLease | null;
  meterCount: number;
  recordedCount: number;
  status: UtilityReadingRoomStatus;
};

export type GetUtilityReadingRoomsParams = Omit<ListQueryParams, "isActive"> & {
  readingMonth: string;
  recorded?: boolean;
};

export type GetUtilityReadingRoomsResponse =
  PagedResult<UtilityReadingRoomListItem>;

export type UtilityReadingRoomMeter = {
  serviceId: string;
  serviceName: string;
  unit: string;
  latest: UtilityReadingSummary | null;
  reading: UtilityReading | null;
  billedLeaseId: string | null;
  effectiveUnitPrice: number | null;
};

export type UtilityReadingRoomCharge = {
  serviceId: string;
  serviceName: string;
  billingMethod: UtilityBillingMethod;
  unit: string;
  unitPrice: number;
  quantity: number;
  amount: number;
};

export type UtilityReadingRoomMeters = {
  roomId: string;
  roomNumber: string;
  roomStatus: RoomStatus;
  readingMonth: string;
  lease: UtilityReadingRoomLease | null;
  meters: UtilityReadingRoomMeter[];
  otherCharges: UtilityReadingRoomCharge[];
};

export type RecordUtilityReadingItem = {
  serviceId: string;
  currentValue: number;
  previousValue?: number;
};

export type RecordRoomUtilityReadingsPayload = {
  readingMonth: string;
  readOn?: string;
  items: RecordUtilityReadingItem[];
};
