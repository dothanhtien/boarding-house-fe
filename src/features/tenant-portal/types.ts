import type {
  InvoiceItemSourceType,
  InvoiceStatus,
} from "@/features/invoices/constants";
import type { LeaseStatus } from "@/features/leases/constants";
import type {
  PaymentMethod,
  PaymentStatus,
} from "@/features/payments/constants";
import type {
  UtilityBillingMethod,
  UtilityType,
} from "@/features/utility-services/constants";
import type { PagedResult } from "@/types";

export type Tenancy = {
  activeLeaseCount: number;
  totalLeaseCount: number;
};

export type MyStay = {
  joinedDate: string;
  leftDate: string | null;
};

export type MyLease = {
  id: string;
  organizationId: string;
  organizationName: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string | null;
  roomId: string;
  roomNumber: string;
  leaseCode: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string | null;
  billingDay: number | null;
  monthlyRent: number;
  depositAmount: number;
  signedAt: string | null;
  terminatedAt: string | null;
  isRepresentative: boolean;
  myStays: MyStay[];
};

export type MyLeaseRoommate = {
  fullName: string;
  isRepresentative: boolean;
  joinedDate: string;
  leftDate: string | null;
};

export type MyLeaseUtilityService = {
  serviceId: string;
  name: string;
  type: UtilityType;
  billingMethod: UtilityBillingMethod;
  unit: string;
  unitPrice: number;
  quantity: number;
};

export type MyLeaseDetail = MyLease & {
  tenants: MyLeaseRoommate[];
  utilityServices: MyLeaseUtilityService[];
};

export type MyInvoice = {
  id: string;
  organizationId: string;
  organizationName: string;
  propertyName: string;
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
  sentAt: string | null;
};

export type MyInvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sourceType: InvoiceItemSourceType;
};

export type MyInvoiceDetail = MyInvoice & { items: MyInvoiceItem[] };

export type MyPayment = {
  id: string;
  organizationId: string;
  organizationName: string;
  propertyName: string;
  roomNumber: string;
  leaseCode: string;
  invoiceId: string;
  invoiceNumber: string;
  payerName: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string | null;
  paymentDate: string;
  confirmedAt: string | null;
  voidedAt: string | null;
};

export type MyUtilityReading = {
  id: string;
  serviceId: string;
  serviceName: string;
  unit: string;
  readOn: string;
  readingMonth: string;
  previousValue: number | null;
  currentValue: number;
  consumption: number | null;
  imageUrl: string | null;
  invoiceNumber: string | null;
};

type PageParams = { page?: number; pageSize?: number };

export type GetMyLeasesParams = PageParams & { status?: LeaseStatus };

export type GetMyInvoicesParams = PageParams & {
  leaseId?: string;
  status?: InvoiceStatus;
  billingMonth?: string;
};

export type GetMyPaymentsParams = PageParams & {
  invoiceId?: string;
  status?: PaymentStatus;
};

export type GetMyUtilityReadingsParams = PageParams & {
  serviceId?: string;
  from?: string;
  to?: string;
};

export type GetMyLeasesResponse = PagedResult<MyLease>;
export type GetMyInvoicesResponse = PagedResult<MyInvoice>;
export type GetMyPaymentsResponse = PagedResult<MyPayment>;
export type GetMyUtilityReadingsResponse = PagedResult<MyUtilityReading>;
