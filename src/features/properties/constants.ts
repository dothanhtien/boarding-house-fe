import type { TabItem } from "@/components/ui/tabs/Tabs";

export const PropertyTab = {
  Rooms: "rooms",
  UtilityServices: "utility-services",
} as const;

export type PropertyTab = (typeof PropertyTab)[keyof typeof PropertyTab];

export const PROPERTY_TABS: TabItem<PropertyTab>[] = [
  { value: PropertyTab.Rooms, label: "Rooms" },
  { value: PropertyTab.UtilityServices, label: "Utility services" },
];
