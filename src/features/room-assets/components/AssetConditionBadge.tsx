import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { ASSET_CONDITION_LABELS } from "@/features/room-assets/constants";
import type { AssetCondition } from "@/features/room-assets/types";

type BadgeColor = React.ComponentProps<typeof Badge>["color"];

const CONDITION_COLORS: Record<AssetCondition, BadgeColor> = {
  good: "success",
  damaged: "warning",
  broken: "error",
};

interface AssetConditionBadgeProps {
  condition: AssetCondition;
}

export const AssetConditionBadge: React.FC<AssetConditionBadgeProps> = ({
  condition,
}) => (
  <Badge size="sm" color={CONDITION_COLORS[condition]}>
    {ASSET_CONDITION_LABELS[condition]}
  </Badge>
);
