import React from "react";
import {
  BedSingle,
  Building,
  Layers2,
  Sofa,
  type LucideIcon,
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { ROOM_CATEGORY_LABELS } from "@/features/rooms/constants";
import type { RoomCategory } from "@/features/rooms/types";

type BadgeColor = React.ComponentProps<typeof Badge>["color"];

const CATEGORY_STYLES: Record<
  RoomCategory,
  { color: BadgeColor; icon: LucideIcon }
> = {
  standard: { color: "light", icon: BedSingle },
  studio: { color: "primary", icon: Sofa },
  duplex: { color: "info", icon: Layers2 },
  apartment: { color: "dark", icon: Building },
};

interface RoomCategoryBadgeProps {
  category: RoomCategory;
  size?: "sm" | "md";
}

export const RoomCategoryBadge: React.FC<RoomCategoryBadgeProps> = ({
  category,
  size = "sm",
}) => {
  const { color, icon: Icon } = CATEGORY_STYLES[category];

  return (
    <Badge
      size={size}
      color={color}
      startIcon={<Icon className="-mr-1 h-3.5 w-3.5" aria-hidden />}
    >
      {ROOM_CATEGORY_LABELS[category]}
    </Badge>
  );
};
