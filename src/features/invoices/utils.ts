import dayjs from "dayjs";
import { RoleSlugs } from "@/enums/roles";
import {
  formatMonth,
  getCurrentLocalMonth,
  getCurrentUtcMonth,
  getMonthOptions,
  toBillingMonth,
} from "@/utils/month";
import {
  INVOICE_MONTH_LOOKBACK,
  InvoiceItemSourceType,
  InvoiceStatus,
} from "./constants";
import {
  isBlankCustomItem,
  type CreateInvoiceFormValues,
  type CustomItemFormValue,
  type EditInvoiceFormValues,
} from "./schemas";
import type {
  CreateInvoicePayload,
  Invoice,
  InvoiceDetail,
  InvoiceItem,
  UpdateInvoiceCustomItemPayload,
  UpdateInvoicePayload,
} from "./types";

const EDITABLE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.Pending,
  InvoiceStatus.Overdue,
];

export const isInvoiceEditable = (invoice: Invoice) =>
  invoice.paidAmount === 0 && EDITABLE_STATUSES.includes(invoice.status);

export const isInvoiceOverdue = (invoice: Pick<Invoice, "status">) =>
  invoice.status === InvoiceStatus.Overdue;

export const isInvoiceCancellable = (invoice: Invoice) =>
  invoice.status !== InvoiceStatus.Cancelled && invoice.paidAmount === 0;

export const canCancelInvoice = (roleSlug: string | null) =>
  roleSlug === RoleSlugs.OrganizationAdmin;

const currentUtcMonthStart = () => dayjs.utc(`${getCurrentUtcMonth()}-01`);

export const getDefaultInvoiceMonth = () => getCurrentLocalMonth();

export const getInvoiceMonthOptions = (
  lookback = INVOICE_MONTH_LOOKBACK,
  today = currentUtcMonthStart(),
) => getMonthOptions({ today, lookback });

export const formatBillingMonth = (billingMonth: string) =>
  formatMonth(billingMonth);

const toDateOnly = (value: string) => value.slice(0, 10);

const trimOrNull = (value: string) => value.trim() || null;

const toCustomItemPayload = (item: CustomItemFormValue) => ({
  description: item.description.trim(),
  quantity: Number(item.quantity),
  unitPrice: Number(item.unitPrice),
});

const toDiscount = (values: {
  discountAmount: string;
  discountReason: string;
}) => {
  const discountAmount = Number(values.discountAmount || 0);
  return {
    discountAmount,
    discountReason:
      discountAmount > 0 ? trimOrNull(values.discountReason) : null,
  };
};

export function toCreateInvoicePayload(
  values: CreateInvoiceFormValues,
): CreateInvoicePayload {
  const customItems = values.customItems
    .filter((item) => !isBlankCustomItem(item))
    .map(toCustomItemPayload);

  return {
    leaseId: values.leaseId,
    billingMonth: toBillingMonth(values.month),
    ...(customItems.length > 0 && { customItems }),
    ...toDiscount(values),
    notes: trimOrNull(values.notes),
  };
}

export const getCustomItems = (invoice: InvoiceDetail) =>
  invoice.items.filter(
    (item) => item.sourceType === InvoiceItemSourceType.Custom,
  );

const toAmountString = (value: number) => String(value);

export function toEditInvoiceFormValues(
  invoice: InvoiceDetail,
): EditInvoiceFormValues {
  return {
    dueDate: toDateOnly(invoice.dueDate),
    discountAmount:
      invoice.discountAmount > 0 ? toAmountString(invoice.discountAmount) : "",
    discountReason: invoice.discountReason ?? "",
    notes: invoice.notes ?? "",
    customItems: getCustomItems(invoice).map((item) => ({
      itemId: item.id,
      description: item.description,
      quantity: toAmountString(item.quantity),
      unitPrice: toAmountString(item.unitPrice),
    })),
  };
}

function diffCustomItem(
  original: InvoiceItem,
  value: CustomItemFormValue,
): UpdateInvoiceCustomItemPayload | null {
  const next = toCustomItemPayload(value);
  const change: UpdateInvoiceCustomItemPayload = { id: original.id };
  if (next.description !== original.description) {
    change.description = next.description;
  }
  if (next.quantity !== original.quantity) change.quantity = next.quantity;
  if (next.unitPrice !== original.unitPrice) change.unitPrice = next.unitPrice;
  return Object.keys(change).length > 1 ? change : null;
}

export function buildInvoicePatch(
  original: InvoiceDetail,
  values: EditInvoiceFormValues,
): UpdateInvoicePayload {
  const patch: UpdateInvoicePayload = {};

  if (values.dueDate !== toDateOnly(original.dueDate)) {
    patch.dueDate = values.dueDate;
  }

  const { discountAmount, discountReason } = toDiscount(values);
  if (discountAmount !== original.discountAmount) {
    patch.discountAmount = discountAmount;
  }
  if (discountReason !== (original.discountReason ?? null)) {
    patch.discountReason = discountReason;
  }

  const notes = trimOrNull(values.notes);
  if (notes !== (original.notes ?? null)) patch.notes = notes;

  const originals = new Map(
    getCustomItems(original).map((item) => [item.id, item]),
  );
  const keptIds = new Set<string>();
  const changes: UpdateInvoiceCustomItemPayload[] = [];

  for (const value of values.customItems) {
    if (isBlankCustomItem(value)) continue;
    const existing = value.itemId ? originals.get(value.itemId) : undefined;
    if (!existing) {
      changes.push(toCustomItemPayload(value));
      continue;
    }
    keptIds.add(existing.id);
    const change = diffCustomItem(existing, value);
    if (change) changes.push(change);
  }

  for (const id of originals.keys()) {
    if (!keptIds.has(id)) changes.push({ id, isDeleted: true });
  }

  if (changes.length > 0) patch.customItems = changes;

  return patch;
}
