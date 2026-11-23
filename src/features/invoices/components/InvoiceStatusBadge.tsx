import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  INVOICE_STATUS_LABELS,
  InvoiceStatus,
} from "@/features/invoices/constants";

type BadgeColor = React.ComponentProps<typeof Badge>["color"];

const STATUS_COLORS: Record<InvoiceStatus, BadgeColor> = {
  [InvoiceStatus.Pending]: "light",
  [InvoiceStatus.Partial]: "info",
  [InvoiceStatus.Paid]: "success",
  [InvoiceStatus.Overdue]: "error",
  [InvoiceStatus.Cancelled]: "dark",
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
}) => (
  <Badge size="sm" color={STATUS_COLORS[status]}>
    {INVOICE_STATUS_LABELS[status]}
  </Badge>
);
