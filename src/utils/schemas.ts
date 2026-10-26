import { z } from "zod";

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

type MoneyOptions = { required: boolean; allowZero: boolean };

export const money = (label: string, { required, allowZero }: MoneyOptions) =>
  z
    .string()
    .refine((value) => !required || value !== "", {
      message: `${label} is required`,
    })
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Number(value)) &&
          (allowZero ? Number(value) >= 0 : Number(value) > 0)),
      {
        message: allowZero
          ? `${label} must not be negative`
          : `${label} must be greater than 0`,
      },
    )
    .refine((value) => value === "" || MONEY_PATTERN.test(value), {
      message: `${label} must have at most 2 decimal places`,
    });

export const requiredChoice = <T extends z.ZodType<string>>(
  schema: T,
  label: string,
) =>
  z
    .union([schema, z.literal("")])
    .refine((value) => value !== "", { message: `${label} is required` });
