import type { FieldNamesMarkedBoolean } from "react-hook-form";
import { HttpStatus } from "@/enums/httpStatus";
import type { ApiError } from "@/lib/axios";
import { formatCurrency } from "@/utils/currency";
import {
  UTILITY_SERVICE_PRESETS,
  UtilityBillingMethod,
  UtilityType,
} from "./constants";
import type { UpdateUtilityServiceFormValues } from "./schemas";
import type { UpdateUtilityServicePayload, UtilityService } from "./types";

const DEFAULT_BILLING_METHODS: Record<UtilityType, UtilityBillingMethod> = {
  [UtilityType.Electricity]: UtilityBillingMethod.Metered,
  [UtilityType.Water]: UtilityBillingMethod.Metered,
  [UtilityType.Internet]: UtilityBillingMethod.Fixed,
  [UtilityType.Parking]: UtilityBillingMethod.Fixed,
  [UtilityType.Garbage]: UtilityBillingMethod.Fixed,
  [UtilityType.Other]: UtilityBillingMethod.Fixed,
};

export function getDefaultBillingMethod(type: UtilityType) {
  return DEFAULT_BILLING_METHODS[type];
}

export function getDefaultUnit(
  type: UtilityType,
  billingMethod: UtilityBillingMethod,
) {
  if (billingMethod === UtilityBillingMethod.PerTenant) return "person";
  if (billingMethod === UtilityBillingMethod.Fixed) {
    return type === UtilityType.Other ? "" : "month";
  }
  if (type === UtilityType.Electricity) return "kWh";
  if (type === UtilityType.Water) return "m³";
  return "";
}

export function getDefaultsForType(type: UtilityType) {
  const billingMethod = getDefaultBillingMethod(type);
  return { billingMethod, unit: getDefaultUnit(type, billingMethod) };
}

export function formatUnitPrice(price: number, unit: string) {
  return `${formatCurrency(price)}/${unit}`;
}

export function buildUpdateUtilityServicePayload(
  values: UpdateUtilityServiceFormValues,
  dirtyFields: Partial<FieldNamesMarkedBoolean<UpdateUtilityServiceFormValues>>,
): UpdateUtilityServicePayload {
  const payload: UpdateUtilityServicePayload = {};
  if (dirtyFields.name) payload.name = values.name.trim();
  if (dirtyFields.unit) payload.unit = values.unit.trim();
  if (dirtyFields.billingMethod) payload.billingMethod = values.billingMethod;
  if (dirtyFields.defaultUnitPrice) {
    payload.defaultUnitPrice = Number(values.defaultUnitPrice);
  }
  return payload;
}

const DUPLICATE_NAME_MESSAGE =
  "A utility service with this name already exists in the property";

export function isDuplicateNameError(error: ApiError) {
  return (
    error.status === HttpStatus.Conflict &&
    error.message === DUPLICATE_NAME_MESSAGE
  );
}

export function getMissingPresets(services: UtilityService[]) {
  const usedTypes = new Set(services.map((service) => service.type));
  return UTILITY_SERVICE_PRESETS.filter(
    (preset) => !usedTypes.has(preset.type),
  );
}

export function supportsQuantity(billingMethod: UtilityBillingMethod) {
  return billingMethod === UtilityBillingMethod.Fixed;
}
