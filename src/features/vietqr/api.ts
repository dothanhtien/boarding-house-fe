import { api } from "@/lib/axios";
import type { InvoicePaymentQr, VietQrBank } from "./types";

export const vietQrApi = {
  async getBanks(signal?: AbortSignal): Promise<VietQrBank[]> {
    const res = await api.get<VietQrBank[]>("/vietqr/banks", { signal });
    return res.data;
  },

  async getInvoicePaymentQr(
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<InvoicePaymentQr> {
    const res = await api.get<InvoicePaymentQr>(
      `/invoices/${invoiceId}/payment-qr`,
      { signal },
    );
    return res.data;
  },
};
