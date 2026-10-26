import React from "react";
import { UTILITY_TYPE_ICONS } from "@/features/utility-services/constants";
import type { UtilityType } from "@/features/utility-services/constants";

interface UtilityTypeIconProps {
  type: UtilityType;
  className?: string;
}

export const UtilityTypeIcon: React.FC<UtilityTypeIconProps> = ({
  type,
  className,
}) =>
  React.createElement(UTILITY_TYPE_ICONS[type], {
    className,
    "aria-hidden": true,
  });
