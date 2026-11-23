import { z } from "zod";
import { money } from "@/utils/schemas";
import {
  INVOICE_CANCEL_REASON_MAX_LENGTH,
  INVOICE_DISCOUNT_REASON_MAX_LENGTH,
  INVOICE_ITEM_DESCRIPTION_MAX_LENGTH,
  INVOICE_MAX_CUSTOM_ITEMS,
  INVOICE_NOTES_MAX_LENGTH,
} from "./constants";

const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;

const quantitySchema = z
  .string()
  .refine((value) => value.trim() !== "", { message: "Quantity is required" })
  .refine(
    (value) => value.trim() === "" || Number(value) > 0,
    "Quantity must be greater than 0",
  )
  .refine(
    (value) => value.trim() === "" || QUANTITY_PATTERN.test(value.trim()),
    "Quantity must have at most 2 decimal places",
  );

const unitPriceSchema = money("Unit price", {
  required: true,
  allowZero: false,
  allowNegative: true,
});

const descriptionSchema = z
  .string()
  .refine((value) => value.trim() !== "", "Description is required")
  .refine(
    (value) => value.trim().length <= INVOICE_ITEM_DESCRIPTION_MAX_LENGTH,
    `Description must not exceed ${INVOICE_ITEM_DESCRIPTION_MAX_LENGTH} characters`,
  );

export const customItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
});

export type CustomItemFormValue = z.infer<typeof customItemSchema>;

export const EMPTY_CUSTOM_ITEM: CustomItemFormValue = {
  description: "",
  quantity: "1",
  unitPrice: "",
};

export const isBlankCustomItem = (item: CustomItemFormValue) =>
  !item.itemId &&
  item.description.trim() === "" &&
  item.unitPrice.trim() === "" &&
  (item.quantity.trim() === "" || item.quantity.trim() === "1");

const customItemsSchema = z
  .array(customItemSchema)
  .max(
    INVOICE_MAX_CUSTOM_ITEMS,
    `At most ${INVOICE_MAX_CUSTOM_ITEMS} custom items are allowed`,
  )
  .superRefine((items, ctx) => {
    items.forEach((item, index) => {
      if (isBlankCustomItem(item)) return;
      const fields = {
        description: descriptionSchema,
        quantity: quantitySchema,
        unitPrice: unitPriceSchema,
      } as const;
      for (const [field, schema] of Object.entries(fields)) {
        const result = schema.safeParse(item[field as keyof typeof fields]);
        if (!result.success) {
          ctx.addIssue({
            code: "custom",
            path: [index, field],
            message: result.error.issues[0].message,
          });
        }
      }
    });
  });

const discountShape = {
  discountAmount: money("Discount", { required: false, allowZero: true }),
  discountReason: z
    .string()
    .max(
      INVOICE_DISCOUNT_REASON_MAX_LENGTH,
      `Discount reason must not exceed ${INVOICE_DISCOUNT_REASON_MAX_LENGTH} characters`,
    ),
  notes: z
    .string()
    .max(
      INVOICE_NOTES_MAX_LENGTH,
      `Notes must not exceed ${INVOICE_NOTES_MAX_LENGTH} characters`,
    ),
  customItems: customItemsSchema,
};

const refineDiscountReason = (
  values: { discountAmount: string; discountReason: string },
  ctx: z.RefinementCtx,
) => {
  if (Number(values.discountAmount || 0) > 0 && !values.discountReason.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["discountReason"],
      message: "Discount reason is required when there is a discount",
    });
  }
};

export const createInvoiceSchema = z
  .object({
    leaseId: z.string().min(1, "Lease is required"),
    month: z.string().min(1, "Billing month is required"),
    ...discountShape,
  })
  .superRefine(refineDiscountReason);

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

export const editInvoiceSchema = z
  .object({
    dueDate: z.string().min(1, "Due date is required"),
    ...discountShape,
  })
  .superRefine(refineDiscountReason);

export type EditInvoiceFormValues = z.infer<typeof editInvoiceSchema>;

export const cancelInvoiceSchema = z.object({
  reason: z
    .string()
    .refine((value) => value.trim() !== "", "Reason is required")
    .refine(
      (value) => value.trim().length <= INVOICE_CANCEL_REASON_MAX_LENGTH,
      `Reason must not exceed ${INVOICE_CANCEL_REASON_MAX_LENGTH} characters`,
    ),
});

export type CancelInvoiceFormValues = z.infer<typeof cancelInvoiceSchema>;
