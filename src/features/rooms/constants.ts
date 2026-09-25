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

// https://undraw.co/illustrations
export const ROOM_CATEGORY_IMAGES: Record<RoomCategory, string> = {
  standard: "/images/rooms/standard.svg",
  studio: "/images/rooms/studio.svg",
  duplex: "/images/rooms/duplex.svg",
  apartment: "/images/rooms/apartment.svg",
};

export const ROOM_STATUS_INDICATOR_CLASSES: Record<
  RoomStatus,
  { ring: string; dot: string; text: string }
> = {
  available: {
    ring: "ring-success-500",
    dot: "bg-success-500",
    text: "text-success-500",
  },
  reserved: {
    ring: "ring-blue-light-500",
    dot: "bg-blue-light-500",
    text: "text-blue-light-500",
  },
  occupied: {
    ring: "ring-warning-500",
    dot: "bg-warning-500",
    text: "text-warning-500",
  },
  maintenance: {
    ring: "ring-error-500",
    dot: "bg-error-500",
    text: "text-error-500",
  },
};
