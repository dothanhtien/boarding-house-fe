import { z } from "zod";
import { money } from "@/utils/schemas";
import { LEASE_CODE_MAX_LENGTH, MAX_LEASE_TENANTS } from "./constants";

const leaseTenantSchema = z.object({
  tenantId: z.string().optional(),
  userId: z.string().min(1),
  fullName: z.string(),
  phone: z.string(),
  isRepresentative: z.boolean(),
  joinedDate: z.string(),
});

export type LeaseTenantFormValue = z.infer<typeof leaseTenantSchema>;

const leaseTenantsSchema = z
  .array(leaseTenantSchema)
  .max(
    MAX_LEASE_TENANTS,
    `A lease must not have more than ${MAX_LEASE_TENANTS} tenants`,
  )
  .refine((tenants) => tenants.filter((t) => t.isRepresentative).length <= 1, {
    message: "A lease can have at most one representative tenant",
  });

const leaseTermsShape = {
  previousLeaseId: z.string(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string(),
  billingDay: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 28),
      { message: "Billing day must be a whole number between 1 and 28" },
    ),
  tenants: leaseTenantsSchema,
};

const refineDates = (
  values: { startDate: string; endDate: string },
  ctx: z.RefinementCtx,
) => {
  if (
    values.startDate &&
    values.endDate &&
    values.endDate <= values.startDate
  ) {
    ctx.addIssue({
      code: "custom",
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }
};

export const createLeaseSchema = z
  .object({
    ...leaseTermsShape,
    propertyId: z.string(),
    roomId: z.string().min(1, "Room is required"),
    leaseCode: z
      .string()
      .trim()
      .max(
        LEASE_CODE_MAX_LENGTH,
        `Lease code exceeds ${LEASE_CODE_MAX_LENGTH} characters`,
      ),
    monthlyRent: money("Monthly rent", { required: false, allowZero: false }),
    depositAmount: money("Deposit amount", {
      required: false,
      allowZero: true,
    }),
  })
  .superRefine(refineDates);

export type CreateLeaseFormValues = z.infer<typeof createLeaseSchema>;

export const updateLeaseSchema = z
  .object({
    ...leaseTermsShape,
    leaseCode: z
      .string()
      .trim()
      .min(1, "Lease code is required")
      .max(
        LEASE_CODE_MAX_LENGTH,
        `Lease code exceeds ${LEASE_CODE_MAX_LENGTH} characters`,
      ),
    monthlyRent: money("Monthly rent", { required: true, allowZero: false }),
    depositAmount: money("Deposit amount", {
      required: true,
      allowZero: true,
    }),
  })
  .superRefine(refineDates);

export type UpdateLeaseFormValues = z.infer<typeof updateLeaseSchema>;

export type LeaseTermsFormValues = Pick<
  UpdateLeaseFormValues,
  | "previousLeaseId"
  | "leaseCode"
  | "startDate"
  | "endDate"
  | "billingDay"
  | "monthlyRent"
  | "depositAmount"
  | "tenants"
>;
