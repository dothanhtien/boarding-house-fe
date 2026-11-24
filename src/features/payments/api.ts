import { api } from "@/lib/axios";
import {
  GetPaymentsParams,
  GetPaymentsResponse,
  Payment,
  RecordPaymentPayload,
  VoidPaymentPayload,
} from "./types";

export const paymentsApi = {
  async getPayments(
    params: GetPaymentsParams,
    signal?: AbortSignal,
  ): Promise<GetPaymentsResponse> {
    const res = await api.get<GetPaymentsResponse>("/payments", {
      params,
      signal,
    });
    return res.data;
  },

  async getPayment(id: string, signal?: AbortSignal): Promise<Payment> {
    const res = await api.get<Payment>(`/payments/${id}`, { signal });
    return res.data;
  },

  async getInvoicePayments(
    invoiceId: string,
    signal?: AbortSignal,
  ): Promise<Payment[]> {
    const res = await api.get<Payment[]>(`/invoices/${invoiceId}/payments`, {
      signal,
    });
    return res.data;
  },

  async recordPayment(
    invoiceId: string,
    payload: RecordPaymentPayload,
  ): Promise<Payment> {
    const res = await api.post<Payment>(
      `/invoices/${invoiceId}/payments`,
      payload,
    );
    return res.data;
  },

  async confirmPayment(id: string): Promise<Payment> {
    const res = await api.post<Payment>(`/payments/${id}/confirm`);
    return res.data;
  },

  async voidPayment(id: string, payload: VoidPaymentPayload): Promise<Payment> {
    const res = await api.post<Payment>(`/payments/${id}/void`, payload);
    return res.data;
  },
};
