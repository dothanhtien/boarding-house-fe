import { z } from "zod";
import {
  OTHER_PAYER,
  PAYER_NAME_MAX_LENGTH,
  PAYMENT_NOTE_MAX_LENGTH,
  PaymentMethod,
  TRANSACTION_REFERENCE_MAX_LENGTH,
  VOID_REASON_MAX_LENGTH,
} from "./constants";

const trimmedMax = (label: string, max: number) =>
  z
    .string()
    .refine(
      (value) => value.trim().length <= max,
      `${label} must not exceed ${max} characters`,
    );

export const buildRecordPaymentSchema = (maxAmount: number, today: string) =>
  z
    .object({
      amount: z
        .string()
        .refine((value) => value.trim() !== "", "Amount is required")
        .refine(
          (value) => value.trim() === "" || /^\d+$/.test(value.trim()),
          "Amount must be a whole number",
        )
        .refine(
          (value) => !/^\d+$/.test(value.trim()) || Number(value) > 0,
          "Amount must be greater than 0",
        )
        .refine(
          (value) => !/^\d+$/.test(value.trim()) || Number(value) <= maxAmount,
          "Amount must not exceed the remaining amount",
        ),
      method: z.enum([PaymentMethod.Cash, PaymentMethod.BankTransfer]),
      receivedOn: z
        .string()
        .min(1, "Received date is required")
        .refine(
          (value) => value === "" || value <= today,
          "Received date must not be in the future",
        ),
      payer: z.string(),
      payerNameOverride: trimmedMax("Payer name", PAYER_NAME_MAX_LENGTH),
      transactionReference: trimmedMax(
        "Transaction reference",
        TRANSACTION_REFERENCE_MAX_LENGTH,
      ),
      note: z
        .string()
        .max(
          PAYMENT_NOTE_MAX_LENGTH,
          `Note must not exceed ${PAYMENT_NOTE_MAX_LENGTH} characters`,
        ),
      confirm: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (values.payer === OTHER_PAYER && !values.payerNameOverride.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["payerNameOverride"],
          message: "Payer name is required",
        });
      }
    });

export type RecordPaymentFormValues = z.infer<
  ReturnType<typeof buildRecordPaymentSchema>
>;

export const voidPaymentSchema = z.object({
  reason: z
    .string()
    .refine((value) => value.trim() !== "", "Reason is required")
    .refine(
      (value) => value.trim().length <= VOID_REASON_MAX_LENGTH,
      `Reason must not exceed ${VOID_REASON_MAX_LENGTH} characters`,
    ),
});

export type VoidPaymentFormValues = z.infer<typeof voidPaymentSchema>;
