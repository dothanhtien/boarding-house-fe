export const PaymentMethod = {
  Cash: "cash",
  BankTransfer: "bankTransfer",
  Momo: "momo",
  ZaloPay: "zaloPay",
  VnPay: "vnPay",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Voided: "voided",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const RECORDABLE_PAYMENT_METHODS = [
  PaymentMethod.Cash,
  PaymentMethod.BankTransfer,
] as const;

export type RecordablePaymentMethod =
  (typeof RECORDABLE_PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "Cash",
  [PaymentMethod.BankTransfer]: "Bank transfer",
  [PaymentMethod.Momo]: "MoMo",
  [PaymentMethod.ZaloPay]: "ZaloPay",
  [PaymentMethod.VnPay]: "VNPay",
};

export const PAYMENT_METHOD_OPTIONS = Object.values(PaymentMethod).map(
  (value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }),
);

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] =
  [
    { value: PaymentStatus.Pending, label: "Pending" },
    { value: PaymentStatus.Confirmed, label: "Confirmed" },
    { value: PaymentStatus.Voided, label: "Voided" },
  ];

export const PAYMENT_STATUS_LABELS = Object.fromEntries(
  PAYMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PaymentStatus, string>;

export const OTHER_PAYER = "__other__";

export const PAYER_NAME_MAX_LENGTH = 100;
export const TRANSACTION_REFERENCE_MAX_LENGTH = 100;
export const PAYMENT_NOTE_MAX_LENGTH = 2000;
export const VOID_REASON_MAX_LENGTH = 1000;

export const TRANSFER_CONTENT_MAX_LENGTH = 25;
