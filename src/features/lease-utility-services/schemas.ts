import { z } from "zod";
import { money } from "@/utils/schemas";

const unitPriceOverrideSchema = money("Price", {
  required: true,
  allowZero: true,
});

export const quantitySchema = z
  .string()
  .refine((value) => /^\d+$/.test(value) && Number(value) > 0, {
    message: "Quantity must be a whole number greater than 0",
  });

export const leaseServicePriceSchema = z
  .object({
    useDefault: z.boolean(),
    unitPriceOverride: z.string(),
    quantity: quantitySchema,
  })
  .superRefine((values, ctx) => {
    if (values.useDefault) return;

    const result = unitPriceOverrideSchema.safeParse(values.unitPriceOverride);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: result.error.issues[0].message,
        path: ["unitPriceOverride"],
      });
    }
  });

export type LeaseServicePriceFormValues = z.infer<
  typeof leaseServicePriceSchema
>;

export const leaseUtilityServiceSelectionSchema = z.object({
  serviceId: z.string().min(1),
  unitPriceOverride: money("Price", { required: false, allowZero: true }),
  quantity: quantitySchema,
});

export type LeaseUtilityServiceSelection = z.infer<
  typeof leaseUtilityServiceSelectionSchema
>;
