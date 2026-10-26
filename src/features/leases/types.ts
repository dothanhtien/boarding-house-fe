import type { LeaseStatus } from "./constants";
import type { CreateLeaseUtilityServicePayload } from "@/features/lease-utility-services/types";
import { ListQueryParams, PagedResult } from "@/types";

export type LeaseTenant = {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  isRepresentative: boolean;
  joinedDate: string | null;
  leftDate: string | null;
};

export type Lease = {
  id: string;
  organizationId: string;
  propertyId: string;
  roomId: string;
  roomNumber: string;
  previousLeaseId: string | null;
  leaseCode: string;
  startDate: string;
  endDate: string | null;
  billingDay: number | null;
  monthlyRent: number;
  depositAmount: number;
  status: LeaseStatus;
  signedAt: string | null;
  terminatedAt: string | null;
  terminationReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  tenants: LeaseTenant[];
};

export type GetLeasesParams = Omit<ListQueryParams, "isActive"> & {
  organizationId?: string;
  propertyId?: string;
  roomId?: string;
  status?: LeaseStatus;
  tenantUserId?: string;
};

export type GetLeasesResponse = PagedResult<Lease>;

export type CreateLeaseTenantPayload = {
  userId: string;
  isRepresentative?: boolean;
  joinedDate?: string | null;
};

export type CreateLeasePayload = {
  roomId: string;
  previousLeaseId?: string | null;
  leaseCode?: string | null;
  startDate: string;
  endDate?: string | null;
  billingDay?: number | null;
  monthlyRent?: number | null;
  depositAmount?: number | null;
  tenants?: CreateLeaseTenantPayload[];
  utilityServices?: CreateLeaseUtilityServicePayload[];
};

export type UpdateLeaseTenantPayload = {
  id?: string;
  userId?: string;
  isRepresentative?: boolean;
  joinedDate?: string | null;
  isDeleted?: boolean;
};

export type TerminateLeasePayload = {
  reason: string;
  leftDate?: string | null;
};

export type UpdateLeasePayload = Partial<{
  previousLeaseId: string | null;
  leaseCode: string;
  startDate: string;
  endDate: string | null;
  billingDay: number | null;
  monthlyRent: number;
  depositAmount: number;
  tenants: UpdateLeaseTenantPayload[];
}>;
