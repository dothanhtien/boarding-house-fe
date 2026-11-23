import { z } from "zod";

const MONEY_PATTERN = /^-?\d+(\.\d{1,2})?$/;

type MoneyOptions = {
  required: boolean;
  allowZero: boolean;
  allowNegative?: boolean;
};

function signMessage(
  label: string,
  allowZero: boolean,
  allowNegative: boolean,
) {
  if (allowNegative) return `${label} must not be 0`;
  return allowZero
    ? `${label} must not be negative`
    : `${label} must be greater than 0`;
}

export const money = (
  label: string,
  { required, allowZero, allowNegative = false }: MoneyOptions,
) =>
  z
    .string()
    .refine((value) => !required || value !== "", {
      message: `${label} is required`,
    })
    .refine(
      (value) => {
        if (value === "") return true;
        const amount = Number(value);
        if (!Number.isFinite(amount)) return false;
        if (amount === 0) return allowZero;
        return allowNegative || amount > 0;
      },
      { message: signMessage(label, allowZero, allowNegative) },
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
