import type { ListQueryParams, PagedResult } from "@/types";

export type OrganizationMember = {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  roleId: string;
  roleSlug: string;
  roleName: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  taxCode: string | null;
  phone: string | null;
  email: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  members: OrganizationMember[] | null;
};

export type GetOrganizationsParams = ListQueryParams;

export type GetOrganizationsResponse = PagedResult<Organization>;

export type CreateOrganizationPayload = {
  name: string;
  taxCode?: string | null;
  phone?: string | null;
  email?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  address?: string | null;
  ownerId: string;
};

export type UpdateOrganizationPayload = Partial<{
  name: string;
  taxCode: string | null;
  phone: string | null;
  email: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  ownerId: string;
  keepPreviousOwnerAsStaff: boolean;
  isActive: boolean;
}>;

export type LateFeeType = "percent" | "fixed";

export type OrganizationSettings = {
  organizationId: string;
  defaultBillingDay: number | null;
  lateFeeType: LateFeeType | null;
  lateFeeValue: number | null;
  lateFeeGraceDays: number | null;
  vatRate: number | null;
  currency: string;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  updatedAt: string | null;
};

export type UpdateOrganizationSettingsPayload = Partial<{
  defaultBillingDay: number | null;
  lateFeeType: LateFeeType | null;
  lateFeeValue: number | null;
  lateFeeGraceDays: number | null;
  vatRate: number | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
}>;
