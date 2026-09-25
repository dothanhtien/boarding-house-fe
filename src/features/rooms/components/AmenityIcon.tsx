import React from "react";
import { getAmenityIcon } from "@/features/rooms/components/amenityIcons";

interface AmenityIconProps {
  icon: string | null | undefined;
  className?: string;
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({ icon, className }) =>
  React.createElement(getAmenityIcon(icon), { className, "aria-hidden": true });
