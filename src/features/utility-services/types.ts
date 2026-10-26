import type { UtilityBillingMethod, UtilityType } from "./constants";

export type UtilityService = {
  id: string;
  propertyId: string;
  name: string;
  type: UtilityType;
  billingMethod: UtilityBillingMethod;
  unit: string;
  defaultUnitPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type GetUtilityServicesParams = {
  propertyId: string;
  type?: UtilityType;
  isActive?: boolean;
};

export type CreateUtilityServicePayload = {
  propertyId: string;
  name: string;
  type: UtilityType;
  billingMethod: UtilityBillingMethod;
  unit: string;
  defaultUnitPrice: number;
  isActive?: boolean;
};

export type UpdateUtilityServicePayload = Partial<{
  name: string;
  unit: string;
  billingMethod: UtilityBillingMethod;
  defaultUnitPrice: number;
  isActive: boolean;
}>;
