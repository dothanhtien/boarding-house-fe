import type { AssetCondition } from "./types";

export const ASSET_CONDITION_OPTIONS: {
  value: AssetCondition;
  label: string;
}[] = [
  { value: "good", label: "Good" },
  { value: "damaged", label: "Damaged" },
  { value: "broken", label: "Broken" },
];

export const ASSET_CONDITION_LABELS = Object.fromEntries(
  ASSET_CONDITION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AssetCondition, string>;

export const MAX_PHOTOS_PER_CONDITION_ENTRY = 10;

export const SPLIT_DEFAULT_CONDITION: Record<AssetCondition, AssetCondition> = {
  good: "damaged",
  damaged: "broken",
  broken: "damaged",
};
