export type VietQrBank = {
  bin: string;
  code: string;
  shortName: string;
};

export type InvoicePaymentQr = {
  invoiceId: string;
  invoiceNumber: string;
  payload: string;
  bankBin: string;
  bankCode: string;
  bankShortName: string;
  accountNumber: string;
  accountName: string | null;
  amount: number;
  transferContent: string;
};
