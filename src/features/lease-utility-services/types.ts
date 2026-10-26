import type {
  UtilityBillingMethod,
  UtilityType,
} from "@/features/utility-services/constants";

export type LeaseUtilityService = {
  serviceId: string;
  name: string;
  type: UtilityType;
  billingMethod: UtilityBillingMethod;
  unit: string;
  defaultUnitPrice: number;
  unitPriceOverride: number | null;
  effectiveUnitPrice: number;
  quantity: number;
  isActive: boolean;
  serviceIsActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type UpsertLeaseUtilityServicePayload = Partial<{
  unitPriceOverride: number | null;
  quantity: number;
  isActive: boolean;
}>;

export type CreateLeaseUtilityServicePayload = {
  serviceId: string;
  unitPriceOverride?: number | null;
  quantity?: number;
};
