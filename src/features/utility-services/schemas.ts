import { z } from "zod";
import { money, requiredChoice } from "@/utils/schemas";
import {
  UTILITY_SERVICE_NAME_MAX_LENGTH,
  UTILITY_SERVICE_UNIT_MAX_LENGTH,
  UtilityBillingMethod,
  UtilityType,
} from "./constants";

const utilityServiceShape = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(
      UTILITY_SERVICE_NAME_MAX_LENGTH,
      `Name exceeds ${UTILITY_SERVICE_NAME_MAX_LENGTH} characters`,
    ),
  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(
      UTILITY_SERVICE_UNIT_MAX_LENGTH,
      `Unit exceeds ${UTILITY_SERVICE_UNIT_MAX_LENGTH} characters`,
    ),
  defaultUnitPrice: money("Default price", {
    required: true,
    allowZero: true,
  }),
};

export const createUtilityServiceSchema = z.object({
  ...utilityServiceShape,
  type: requiredChoice(z.enum(UtilityType), "Type"),
  billingMethod: requiredChoice(z.enum(UtilityBillingMethod), "Billing method"),
});

export type CreateUtilityServiceFormValues = z.infer<
  typeof createUtilityServiceSchema
>;

export const updateUtilityServiceSchema = z.object({
  ...utilityServiceShape,
  type: requiredChoice(z.enum(UtilityType), "Type").pipe(z.enum(UtilityType)),
  billingMethod: requiredChoice(
    z.enum(UtilityBillingMethod),
    "Billing method",
  ).pipe(z.enum(UtilityBillingMethod)),
});

export type UpdateUtilityServiceFormValues = z.infer<
  typeof updateUtilityServiceSchema
>;
