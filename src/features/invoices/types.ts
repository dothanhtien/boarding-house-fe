import type {
  InvoiceIssueCode,
  InvoiceItemSourceType,
  InvoiceStatus,
} from "./constants";
import { ListQueryParams, PagedResult } from "@/types";

export type Invoice = {
  id: string;
  organizationId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  leaseId: string;
  leaseCode: string;
  invoiceNumber: string;
  billingMonth: string;
  dueDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  lateFeeAmount: number;
  discountAmount: number;
  discountReason: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  notes: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type InvoiceLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
  sourceType: InvoiceItemSourceType;
  sourceId: string | null;
};

export type InvoiceItem = InvoiceLine & { id: string };

export type InvoiceDetail = Invoice & { items: InvoiceItem[] };

export type InvoiceIssue = {
  code: InvoiceIssueCode;
  message: string;
  serviceId: string | null;
};

export type InvoicePreview = {
  organizationId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  leaseId: string;
  leaseCode: string;
  billingMonth: string;
  dueDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discountAmount: number;
  discountReason: string | null;
  totalAmount: number;
  items: InvoiceLine[];
  errors: InvoiceIssue[];
  warnings: InvoiceIssue[];
  canCreate: boolean;
};

export type InvoiceStatusHistory = {
  id: string;
  oldStatus: InvoiceStatus | null;
  newStatus: InvoiceStatus;
  reason: string | null;
  changedBy: string | null;
  changedAt: string;
};

export type GetInvoicesParams = Omit<ListQueryParams, "isActive"> & {
  propertyId?: string;
  roomId?: string;
  leaseId?: string;
  status?: InvoiceStatus;
  billingMonth?: string;
};

export type GetInvoicesResponse = PagedResult<Invoice>;

export type CreateInvoiceCustomItemPayload = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type CreateInvoicePayload = {
  leaseId: string;
  billingMonth: string;
  customItems?: CreateInvoiceCustomItemPayload[];
  discountAmount: number;
  discountReason?: string | null;
  notes?: string | null;
};

export type UpdateInvoiceCustomItemPayload = {
  id?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  isDeleted?: boolean;
};

export type UpdateInvoicePayload = Partial<{
  discountAmount: number;
  discountReason: string | null;
  notes: string | null;
  dueDate: string;
  customItems: UpdateInvoiceCustomItemPayload[];
}>;

export type CancelInvoicePayload = {
  reason: string;
};
