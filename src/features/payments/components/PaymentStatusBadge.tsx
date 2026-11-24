import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  PAYMENT_STATUS_LABELS,
  PaymentStatus,
} from "@/features/payments/constants";

type BadgeColor = React.ComponentProps<typeof Badge>["color"];

const STATUS_COLORS: Record<PaymentStatus, BadgeColor> = {
  [PaymentStatus.Pending]: "warning",
  [PaymentStatus.Confirmed]: "success",
  [PaymentStatus.Voided]: "light",
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
}) => (
  <Badge size="sm" color={STATUS_COLORS[status]}>
    {PAYMENT_STATUS_LABELS[status]}
  </Badge>
);
