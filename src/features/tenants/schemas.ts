import { z } from "zod";
import { isValidEmail, normalizeEmail } from "@/utils/email";
import { isValidPhone, normalizePhone } from "@/utils/phone";

export const createTenantSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(255, "Full name exceeds 255 characters"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required")
      .refine((value) => isValidPhone(normalizePhone(value)), {
        message: "Phone must be a 10-digit number starting with 0 or +84",
      }),
    email: z
      .string()
      .trim()
      .max(255, "Email exceeds 255 characters")
      .refine((value) => value === "" || isValidEmail(normalizeEmail(value)), {
        message: "Email is invalid",
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password exceeds 72 characters"),
    passwordConfirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;
