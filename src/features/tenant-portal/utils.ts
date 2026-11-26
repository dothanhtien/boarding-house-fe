import { InvoiceStatus } from "@/features/invoices/constants";
import { LeaseStatus } from "@/features/leases/constants";
import type { MyInvoice, MyLease, MyStay } from "./types";

export const isStayCovering = (stay: MyStay, day: string) =>
  stay.joinedDate <= day && (stay.leftDate === null || stay.leftDate >= day);

export const isStayingNow = (lease: MyLease, today: string) =>
  lease.status === LeaseStatus.Active &&
  lease.myStays.some((stay) => isStayCovering(stay, today));

export const currentStay = (lease: MyLease): MyStay | undefined =>
  lease.myStays[lease.myStays.length - 1];

export const getMovedOutDate = (lease: MyLease) =>
  currentStay(lease)?.leftDate ?? null;

const UNPAID_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.Pending,
  InvoiceStatus.Partial,
  InvoiceStatus.Overdue,
];

export const isInvoiceUnpaid = (invoice: MyInvoice) =>
  UNPAID_STATUSES.includes(invoice.status) && invoice.remainingAmount > 0;
