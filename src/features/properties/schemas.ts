import { z } from "zod";

const propertyBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name exceeds 255 characters"),
  description: z.string(),
  province: z.string().trim().max(100, "Province exceeds 100 characters"),
  district: z.string().trim().max(100, "District exceeds 100 characters"),
  ward: z.string().trim().max(100, "Ward exceeds 100 characters"),
  address: z.string(),
  defaultBillingDay: z
    .string()
    .refine((value) => value === "" || /^\d+$/.test(value), {
      message: "Default billing day must be a whole number",
    })
    .refine(
      (value) => value === "" || (Number(value) >= 1 && Number(value) <= 28),
      { message: "Default billing day must be between 1 and 28" },
    ),
  lateFeeType: z.enum(["", "percent", "fixed"]),
  lateFeeValue: z.string().refine((value) => {
    if (value === "") return true;
    return !Number.isNaN(Number(value)) && Number(value) >= 0;
  }, "Late fee value must be a non-negative number"),
  lateFeeGraceDays: z
    .string()
    .refine((value) => value === "" || /^\d+$/.test(value), {
      message: "Late fee grace days must be a non-negative whole number",
    }),
});

const lateFeePercentRefinement = (data: {
  lateFeeType: string;
  lateFeeValue: string;
}) => {
  if (data.lateFeeType !== "percent" || data.lateFeeValue === "") return true;
  return Number(data.lateFeeValue) <= 100;
};

export const createPropertySchema = propertyBaseSchema
  .refine((data) => (data.lateFeeType === "") === (data.lateFeeValue === ""), {
    message: "Late fee type and late fee value must be set together",
    path: ["lateFeeValue"],
  })
  .refine(lateFeePercentRefinement, {
    message: "Late fee value must not exceed 100 when type is percent",
    path: ["lateFeeValue"],
  });

export type CreatePropertyFormValues = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = propertyBaseSchema
  .extend({
    isActive: z.boolean(),
  })
  .refine((data) => (data.lateFeeType === "") === (data.lateFeeValue === ""), {
    message: "Late fee type and late fee value must be set together",
    path: ["lateFeeValue"],
  })
  .refine(lateFeePercentRefinement, {
    message: "Late fee value must not exceed 100 when type is percent",
    path: ["lateFeeValue"],
  });

export type UpdatePropertyFormValues = z.infer<typeof updatePropertySchema>;
