import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { LEASE_STATUS_LABELS, LeaseStatus } from "@/features/leases/constants";

type BadgeColor = React.ComponentProps<typeof Badge>["color"];

const STATUS_COLORS: Record<LeaseStatus, BadgeColor> = {
  [LeaseStatus.Draft]: "light",
  [LeaseStatus.Active]: "success",
  [LeaseStatus.Expired]: "warning",
  [LeaseStatus.Terminated]: "error",
};

interface LeaseStatusBadgeProps {
  status: LeaseStatus;
}

export const LeaseStatusBadge: React.FC<LeaseStatusBadgeProps> = ({
  status,
}) => (
  <Badge size="sm" color={STATUS_COLORS[status]}>
    {LEASE_STATUS_LABELS[status]}
  </Badge>
);
