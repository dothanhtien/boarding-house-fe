import { LateFeeType } from "@/features/organizations/types";
import { ListQueryParams, PagedResult } from "@/types";

export type Property = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  isActive: boolean;
  defaultBillingDay: number | null;
  lateFeeType: LateFeeType | null;
  lateFeeValue: number | null;
  lateFeeGraceDays: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type GetPropertiesParams = ListQueryParams;

export type GetPropertiesResponse = PagedResult<Property>;

export type CreatePropertyPayload = {
  name: string;
  description?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  address?: string | null;
  defaultBillingDay?: number | null;
  lateFeeType?: LateFeeType | null;
  lateFeeValue?: number | null;
  lateFeeGraceDays?: number | null;
};

export type UpdatePropertyPayload = Partial<{
  name: string;
  description: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  isActive: boolean;
  defaultBillingDay: number | null;
  lateFeeType: LateFeeType | null;
  lateFeeValue: number | null;
  lateFeeGraceDays: number | null;
}>;
