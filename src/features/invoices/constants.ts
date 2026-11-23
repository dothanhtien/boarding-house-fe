export const InvoiceStatus = {
  Pending: "pending",
  Partial: "partial",
  Paid: "paid",
  Overdue: "overdue",
  Cancelled: "cancelled",
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const InvoiceItemSourceType = {
  Rent: "rent",
  Deposit: "deposit",
  Utility: "utility",
  Parking: "parking",
  Custom: "custom",
} as const;

export type InvoiceItemSourceType =
  (typeof InvoiceItemSourceType)[keyof typeof InvoiceItemSourceType];

export const InvoiceIssueCode = {
  LeaseNotBillable: "leaseNotBillable",
  AlreadyInvoiced: "alreadyInvoiced",
  MonthBeforeStart: "monthBeforeStart",
  MonthAfterEnd: "monthAfterEnd",
  UnsupportedCurrency: "unsupportedCurrency",
  MissingReading: "missingReading",
  NoItems: "noItems",
  NegativeTotal: "negativeTotal",
  ReadingWithoutConsumption: "readingWithoutConsumption",
  ServiceNotOnLease: "serviceNotOnLease",
  ReadingBilledElsewhere: "readingBilledElsewhere",
} as const;

export type InvoiceIssueCode =
  (typeof InvoiceIssueCode)[keyof typeof InvoiceIssueCode];

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] =
  [
    { value: InvoiceStatus.Pending, label: "Pending" },
    { value: InvoiceStatus.Partial, label: "Partially paid" },
    { value: InvoiceStatus.Paid, label: "Paid" },
    { value: InvoiceStatus.Overdue, label: "Overdue" },
    { value: InvoiceStatus.Cancelled, label: "Cancelled" },
  ];

export const INVOICE_STATUS_LABELS = Object.fromEntries(
  INVOICE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<InvoiceStatus, string>;

export const INVOICE_MAX_CUSTOM_ITEMS = 20;
export const INVOICE_ITEM_DESCRIPTION_MAX_LENGTH = 255;
export const INVOICE_DISCOUNT_REASON_MAX_LENGTH = 255;
export const INVOICE_NOTES_MAX_LENGTH = 2000;
export const INVOICE_CANCEL_REASON_MAX_LENGTH = 1000;

export const INVOICE_MONTH_LOOKBACK = 12;

export const INVOICE_FILTER_MONTH_LOOKBACK = 36;

export const INVOICE_PREVIEW_DEBOUNCE_MS = 400;
