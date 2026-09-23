import {
  AirVent,
  ArrowUpDown,
  Bath,
  BedDouble,
  Bike,
  Cctv,
  CircleCheck,
  CookingPot,
  DoorOpen,
  Dumbbell,
  Fan,
  Heater,
  KeyRound,
  LampDesk,
  Microwave,
  PawPrint,
  Refrigerator,
  ShieldCheck,
  Shirt,
  ShowerHead,
  Sofa,
  Sparkles,
  SquareParking,
  Sun,
  Toilet,
  Trees,
  Tv,
  WashingMachine,
  WavesLadder,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export type RoomAmenityIconOption = {
  key: string;
  label: string;
  icon: LucideIcon;
};

export const ROOM_AMENITY_ICON_OPTIONS: RoomAmenityIconOption[] = [
  { key: "wifi", label: "WiFi", icon: Wifi },
  { key: "air-conditioner", label: "Air conditioner", icon: AirVent },
  { key: "fan", label: "Fan", icon: Fan },
  { key: "heater", label: "Heater", icon: Heater },
  { key: "water-heater", label: "Water heater", icon: ShowerHead },
  { key: "tv", label: "TV", icon: Tv },
  { key: "refrigerator", label: "Refrigerator", icon: Refrigerator },
  { key: "microwave", label: "Microwave", icon: Microwave },
  { key: "washing-machine", label: "Washing machine", icon: WashingMachine },
  { key: "kitchen", label: "Kitchen", icon: CookingPot },
  { key: "bed", label: "Bed", icon: BedDouble },
  { key: "sofa", label: "Sofa", icon: Sofa },
  { key: "wardrobe", label: "Wardrobe", icon: Shirt },
  { key: "desk", label: "Desk", icon: LampDesk },
  { key: "private-bathroom", label: "Private bathroom", icon: Bath },
  { key: "toilet", label: "Toilet", icon: Toilet },
  { key: "balcony", label: "Balcony", icon: Sun },
  { key: "garden", label: "Garden", icon: Trees },
  { key: "parking", label: "Parking", icon: SquareParking },
  { key: "motorbike-parking", label: "Motorbike parking", icon: Bike },
  { key: "elevator", label: "Elevator", icon: ArrowUpDown },
  { key: "private-entrance", label: "Private entrance", icon: DoorOpen },
  { key: "keyless-entry", label: "Keyless entry", icon: KeyRound },
  { key: "security-camera", label: "Security camera", icon: Cctv },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "cleaning", label: "Cleaning service", icon: Sparkles },
  { key: "gym", label: "Gym", icon: Dumbbell },
  { key: "swimming-pool", label: "Swimming pool", icon: WavesLadder },
  { key: "pet-friendly", label: "Pet friendly", icon: PawPrint },
];

const ICONS_BY_KEY = new Map(
  ROOM_AMENITY_ICON_OPTIONS.map((option) => [option.key, option]),
);

export const DEFAULT_AMENITY_ICON: LucideIcon = CircleCheck;

export function getAmenityIconOption(key: string | null | undefined) {
  return key ? ICONS_BY_KEY.get(key) : undefined;
}

export function getAmenityIcon(key: string | null | undefined): LucideIcon {
  return getAmenityIconOption(key)?.icon ?? DEFAULT_AMENITY_ICON;
}
