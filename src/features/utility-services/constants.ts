import {
  CircleEllipsis,
  Droplet,
  SquareParking,
  Trash2,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const UtilityType = {
  Electricity: "electricity",
  Water: "water",
  Internet: "internet",
  Parking: "parking",
  Garbage: "garbage",
  Other: "other",
} as const;

export type UtilityType = (typeof UtilityType)[keyof typeof UtilityType];

export const UtilityBillingMethod = {
  Metered: "metered",
  Fixed: "fixed",
  PerTenant: "perTenant",
} as const;

export type UtilityBillingMethod =
  (typeof UtilityBillingMethod)[keyof typeof UtilityBillingMethod];

export const UTILITY_SERVICE_NAME_MAX_LENGTH = 100;

export const UTILITY_SERVICE_UNIT_MAX_LENGTH = 30;

export const UTILITY_TYPE_OPTIONS: { value: UtilityType; label: string }[] = [
  { value: UtilityType.Electricity, label: "Electricity" },
  { value: UtilityType.Water, label: "Water" },
  { value: UtilityType.Internet, label: "Internet" },
  { value: UtilityType.Parking, label: "Parking" },
  { value: UtilityType.Garbage, label: "Garbage" },
  { value: UtilityType.Other, label: "Other" },
];

export const UTILITY_TYPE_LABELS = Object.fromEntries(
  UTILITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<UtilityType, string>;

export const UTILITY_TYPE_ICONS: Record<UtilityType, LucideIcon> = {
  [UtilityType.Electricity]: Zap,
  [UtilityType.Water]: Droplet,
  [UtilityType.Internet]: Wifi,
  [UtilityType.Parking]: SquareParking,
  [UtilityType.Garbage]: Trash2,
  [UtilityType.Other]: CircleEllipsis,
};

export const UTILITY_BILLING_METHOD_OPTIONS: {
  value: UtilityBillingMethod;
  label: string;
  description: string;
}[] = [
  {
    value: UtilityBillingMethod.Metered,
    label: "Metered",
    description: "Record meter readings every month",
  },
  {
    value: UtilityBillingMethod.Fixed,
    label: "Fixed",
    description: "Same amount every month, custom quantity per lease",
  },
  {
    value: UtilityBillingMethod.PerTenant,
    label: "Per tenant",
    description: "Amount × number of tenants",
  },
];

export const UTILITY_BILLING_METHOD_LABELS = Object.fromEntries(
  UTILITY_BILLING_METHOD_OPTIONS.map((option) => [option.value, option.label]),
) as Record<UtilityBillingMethod, string>;

export type UtilityServicePreset = { name: string; type: UtilityType };

export const UTILITY_SERVICE_PRESETS: UtilityServicePreset[] = [
  { name: "Electricity", type: UtilityType.Electricity },
  { name: "Water", type: UtilityType.Water },
  { name: "Internet", type: UtilityType.Internet },
  { name: "Garbage", type: UtilityType.Garbage },
];
