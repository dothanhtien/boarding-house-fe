import { PROPERTY_TABS, PropertyTab } from "./constants";

export const parsePropertyTab = (value: unknown): PropertyTab =>
  PROPERTY_TABS.some((tab) => tab.value === value)
    ? (value as PropertyTab)
    : PropertyTab.Rooms;
