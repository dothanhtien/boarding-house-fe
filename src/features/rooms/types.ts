import { ListQueryParams, PagedResult } from "@/types";

export type RoomCategory = "standard" | "studio" | "duplex" | "apartment";

export type RoomStatus = "available" | "reserved" | "occupied" | "maintenance";

export type RoomAmenity = {
  id: string;
  name: string;
  quantity: number | null;
  icon: string | null;
};

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
  amenities: RoomAmenity[];
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
  amenities?: CreateRoomAmenityPayload[];
};

export type CreateRoomAmenityPayload = {
  name: string;
  quantity?: number | null;
  icon?: string | null;
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
  amenities: UpdateRoomAmenityPayload[];
}>;

export type UpdateRoomAmenityPayload = {
  id?: string;
  name?: string;
  quantity?: number | null;
  icon?: string | null;
  isDeleted?: boolean;
};
