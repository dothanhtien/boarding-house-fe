import type { LeaseStatus } from "@/features/leases/constants";

export type LookupTenantParams = { phone: string } | { email: string };

export type TenantLookupResult = {
  id: string;
  fullName: string;
  maskedPhone: string | null;
  maskedEmail: string | null;
  hasTenantProfile: boolean;
  isActive: boolean;
};

export type CreateTenantPayload = {
  organizationId?: string;
  fullName: string;
  phone: string;
  email?: string | null;
  password: string;
  passwordConfirmation: string;
};

export type TenantLease = {
  leaseId: string;
  leaseCode: string;
  organizationId: string;
  roomId: string;
  roomNumber: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string | null;
};

export type Tenant = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  leases: TenantLease[];
};
