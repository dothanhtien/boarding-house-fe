import dayjs, { type Dayjs } from "dayjs";
import { RoleSlugs } from "@/enums/roles";
import { InvoiceStatus } from "@/features/invoices/constants";
import type { Invoice } from "@/features/invoices/types";
import type { Lease } from "@/features/leases/types";
import { DateFormat } from "@/utils/date";
import {
  OTHER_PAYER,
  PaymentMethod,
  PaymentStatus,
  TRANSFER_CONTENT_MAX_LENGTH,
} from "./constants";
import type { RecordPaymentFormValues } from "./schemas";
import type { Payment, RecordPaymentPayload } from "./types";

export const getRecordableAmount = (invoice: Invoice) =>
  Math.max(0, Math.floor(invoice.remainingAmount));

export const canRecordPayment = (invoice: Invoice) =>
  invoice.status !== InvoiceStatus.Cancelled &&
  getRecordableAmount(invoice) >= 1;

export const canConfirmPayment = (payment: Payment) =>
  payment.status === PaymentStatus.Pending;

export const canVoidPayment = (roleSlug: string | null, payment: Payment) =>
  roleSlug === RoleSlugs.OrganizationAdmin &&
  payment.status !== PaymentStatus.Voided;

const sumByStatus = (payments: Payment[], status: PaymentStatus) =>
  payments
    .filter((payment) => payment.status === status)
    .reduce((total, payment) => total + payment.amount, 0);

export const sumConfirmed = (payments: Payment[]) =>
  sumByStatus(payments, PaymentStatus.Confirmed);

export const sumPending = (payments: Payment[]) =>
  sumByStatus(payments, PaymentStatus.Pending);

export function toPaymentDate(date: string, now: Dayjs = dayjs()) {
  if (date === now.format(DateFormat.Date)) return now.toISOString();
  return dayjs(`${date}T12:00:00`).toISOString();
}

export const toTransferContent = (invoiceNumber: string) =>
  invoiceNumber
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, TRANSFER_CONTENT_MAX_LENGTH);

export const getRepresentative = (lease: Lease | undefined) =>
  lease?.tenants.find((tenant) => tenant.isRepresentative);

export function getPayerOptions(lease: Lease | undefined) {
  const tenants = [...(lease?.tenants ?? [])].sort(
    (a, b) => Number(b.isRepresentative) - Number(a.isRepresentative),
  );
  return [
    ...tenants.map((tenant) => ({
      value: tenant.userId,
      label: `${tenant.fullName}${
        tenant.isRepresentative ? " (representative)" : ""
      }${tenant.leftDate ? " (moved out)" : ""}`,
    })),
    { value: OTHER_PAYER, label: "Someone else…" },
  ];
}

const trimmedOrUndefined = (value: string) => value.trim() || undefined;

export function toRecordPaymentPayload(
  values: RecordPaymentFormValues,
  lease: Lease | undefined,
  now: Dayjs = dayjs(),
): RecordPaymentPayload {
  const payload: RecordPaymentPayload = {
    amount: Number(values.amount),
    method: values.method,
    paymentDate: toPaymentDate(values.receivedOn, now),
    confirm: values.confirm,
  };

  if (values.payer === OTHER_PAYER) {
    payload.payerNameOverride = values.payerNameOverride.trim();
  } else if (
    values.payer &&
    values.payer !== getRepresentative(lease)?.userId
  ) {
    payload.payerUserId = values.payer;
  }

  if (values.method === PaymentMethod.BankTransfer) {
    const reference = trimmedOrUndefined(values.transactionReference);
    if (reference) payload.transactionReference = reference;
  }

  const note = trimmedOrUndefined(values.note);
  if (note) payload.note = note;

  return payload;
}

export const isDateRangeValid = (from: string, to: string) =>
  !from || !to || to >= from;
