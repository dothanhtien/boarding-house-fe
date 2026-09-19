import type { ListQueryParams, PagedResult } from "@/types";

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
};

export type UpdateOrganizationPayload = Partial<
  Omit<Organization, "id" | "createdAt" | "updatedAt">
>;

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
