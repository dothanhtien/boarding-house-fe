import { z } from "zod";

const organizationBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name exceeds 255 characters"),
  taxCode: z.string().trim().max(20, "Tax code exceeds 20 characters"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone exceeds 20 characters")
    .refine((value) => value === "" || /^\+?\d+$/.test(value), {
      message: "Phone must contain digits only (optionally starting with +)",
    }),
  email: z
    .string()
    .trim()
    .max(255, "Email exceeds 255 characters")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      {
        message: "Email is invalid",
      },
    ),
  province: z.string().trim().max(100, "Province exceeds 100 characters"),
  district: z.string().trim().max(100, "District exceeds 100 characters"),
  ward: z.string().trim().max(100, "Ward exceeds 100 characters"),
  address: z.string(),
});

export const createOrganizationSchema = organizationBaseSchema.extend({
  ownerId: z.string().trim().min(1, "Owner is required"),
});

export type CreateOrganizationFormValues = z.infer<
  typeof createOrganizationSchema
>;

export const updateOrganizationSchema = organizationBaseSchema.extend({
  ownerId: z.string().trim().min(1, "Owner is required"),
  keepPreviousOwnerAsStaff: z.boolean(),
  isActive: z.boolean(),
});

export type UpdateOrganizationFormValues = z.infer<
  typeof updateOrganizationSchema
>;

export const organizationSettingsSchema = z
  .object({
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
      return !Number.isNaN(Number(value));
    }, "Late fee value must be a number"),
    lateFeeGraceDays: z
      .string()
      .refine((value) => value === "" || /^\d+$/.test(value), {
        message: "Late fee grace days must not be negative",
      }),
    vatRate: z
      .string()
      .refine((value) => value === "" || !Number.isNaN(Number(value)), {
        message: "Vat rate must be a number",
      })
      .refine(
        (value) => value === "" || (Number(value) >= 0 && Number(value) <= 100),
        { message: "Vat rate must be between 0 and 100" },
      ),
    bankAccountNumber: z
      .string()
      .max(50, "Bank account number exceeds 50 characters"),
    bankName: z.string().max(100, "Bank name exceeds 100 characters"),
    bankAccountName: z
      .string()
      .max(100, "Bank account name exceeds 100 characters"),
  })
  .refine((data) => (data.lateFeeType === "") === (data.lateFeeValue === ""), {
    message: "Late fee type and late fee value must be set together",
    path: ["lateFeeValue"],
  });

export type OrganizationSettingsFormValues = z.infer<
  typeof organizationSettingsSchema
>;
