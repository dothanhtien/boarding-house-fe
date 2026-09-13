import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Email is invalid")
      .max(255, "Email exceeds 255 characters"),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(255, "Full name exceeds 255 characters"),
    phone: z.string().max(20, "Phone exceeds 20 characters"),
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

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
