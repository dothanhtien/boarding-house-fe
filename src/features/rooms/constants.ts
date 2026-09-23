import type { RoomCategory, RoomStatus } from "./types";

export const ROOM_CATEGORY_OPTIONS: { value: RoomCategory; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "studio", label: "Studio" },
  { value: "duplex", label: "Duplex" },
  { value: "apartment", label: "Apartment" },
];

export const ROOM_STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
];

export const ROOM_CATEGORY_LABELS = Object.fromEntries(
  ROOM_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<RoomCategory, string>;

export const ROOM_STATUS_LABELS = Object.fromEntries(
  ROOM_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<RoomStatus, string>;

export const ROOM_STATUS_BADGE_COLORS: Record<
  RoomStatus,
  "success" | "info" | "warning" | "error"
> = {
  available: "success",
  reserved: "info",
  occupied: "warning",
  maintenance: "error",
};
