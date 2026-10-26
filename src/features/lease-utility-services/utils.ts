import { HttpStatus } from "@/enums/httpStatus";
import { LeaseStatus } from "@/features/leases/constants";
import type { UtilityService } from "@/features/utility-services/types";
import type { ApiError } from "@/lib/axios";
import { formatCurrency } from "@/utils/currency";
import type { LeaseUtilityService } from "./types";

export function getLeaseServiceActions(status: LeaseStatus) {
  const isOpen = status === LeaseStatus.Draft || status === LeaseStatus.Active;

  return {
    canAdd: isOpen,
    canEditPrice: isOpen,
    canToggleActive: isOpen,
    canRemove: status === LeaseStatus.Draft,
  };
}

export function getAttachableServices(
  propertyServices: UtilityService[],
  leaseServices: LeaseUtilityService[],
) {
  const attached = new Set(leaseServices.map((s) => s.serviceId));
  return propertyServices.filter((s) => s.isActive && !attached.has(s.id));
}

const SERVICE_DELETED_MESSAGE = "This service was deleted from the property";

export function getStaleStateErrorMessage(error: ApiError) {
  if (error.status === HttpStatus.NotFound) return SERVICE_DELETED_MESSAGE;
  if (error.status === HttpStatus.Conflict) return error.message;

  return null;
}

export function formatQuantityTotal(unitPrice: number, quantity: number) {
  const total = Math.round(unitPrice * quantity * 100) / 100;
  return `${quantity} × ${formatCurrency(unitPrice)} = ${formatCurrency(total)}`;
}
