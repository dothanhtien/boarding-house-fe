import { HttpStatus } from "@/enums/httpStatus";
import { InvoiceStatus } from "@/features/invoices/constants";
import type { Invoice } from "@/features/invoices/types";
import type { ApiError } from "@/lib/axios";
import type { VietQrBank } from "./types";

const QR_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.Pending,
  InvoiceStatus.Partial,
  InvoiceStatus.Overdue,
];

export const isQrAvailable = (invoice: Invoice) =>
  QR_STATUSES.includes(invoice.status) && invoice.remainingAmount >= 1;

const NOT_CONFIGURED_MESSAGE = "bank account is not configured";

export const isBankNotConfiguredError = (error: ApiError | null | undefined) =>
  !!error &&
  error.status === HttpStatus.Conflict &&
  error.message.toLowerCase().includes(NOT_CONFIGURED_MESSAGE);

export const formatBankOption = (bank: VietQrBank) =>
  `${bank.shortName} (${bank.code})`;

export const VIETQR_ACCOUNT_NUMBER_PATTERN = /^[A-Za-z0-9]{1,19}$/;

export const isValidVietQrAccountNumber = (value: string) =>
  VIETQR_ACCOUNT_NUMBER_PATTERN.test(value);

export const buildQrImageFileName = (invoiceNumber: string) =>
  `${invoiceNumber}-qr.png`;
