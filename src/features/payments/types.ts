import type {
  PaymentMethod,
  PaymentStatus,
  RecordablePaymentMethod,
} from "./constants";
import { ListQueryParams, PagedResult } from "@/types";

export type Payment = {
  id: string;
  organizationId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  leaseId: string;
  leaseCode: string;
  invoiceId: string;
  invoiceNumber: string;
  payerUserId: string | null;
  payerNameOverride: string | null;
  payerName: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string | null;
  paymentDate: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  voidedBy: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
};

export type GetPaymentsParams = Omit<ListQueryParams, "isActive"> & {
  propertyId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  from?: string;
  to?: string;
};

export type GetPaymentsResponse = PagedResult<Payment>;

export type RecordPaymentPayload = {
  amount: number;
  method: RecordablePaymentMethod;
  paymentDate: string;
  payerUserId?: string;
  payerNameOverride?: string;
  transactionReference?: string;
  note?: string;
  confirm: boolean;
};

export type VoidPaymentPayload = {
  reason: string;
};
