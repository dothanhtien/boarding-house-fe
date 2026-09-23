import { ListQueryParams, PagedResult } from "@/types";

export type RoomCategory = "standard" | "studio" | "duplex" | "apartment";

export type RoomStatus = "available" | "reserved" | "occupied" | "maintenance";

export type Room = {
  id: string;
  propertyId: string;
  roomNumber: string;
  roomCategory: RoomCategory;
  roomStatus: RoomStatus;
  floorNumber: number | null;
  area: number | null;
  capacity: number | null;
  monthlyRent: number | null;
  depositAmount: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type GetRoomsParams = Omit<ListQueryParams, "isActive"> & {
  propertyId?: string;
  roomCategory?: RoomCategory;
  roomStatus?: RoomStatus;
};

export type GetRoomsResponse = PagedResult<Room>;

export type CreateRoomPayload = {
  propertyId: string;
  roomNumber: string;
  roomCategory?: RoomCategory;
  floorNumber?: number | null;
  area?: number | null;
  capacity?: number | null;
  monthlyRent?: number | null;
  depositAmount?: number | null;
  note?: string | null;
};

export type UpdateRoomPayload = Partial<{
  roomNumber: string;
  roomCategory: RoomCategory;
  roomStatus: RoomStatus;
  floorNumber: number | null;
  area: number | null;
  capacity: number | null;
  monthlyRent: number | null;
  depositAmount: number | null;
  note: string | null;
}>;
