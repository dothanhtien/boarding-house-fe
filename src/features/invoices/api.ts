import { api } from "@/lib/axios";
import {
  CancelInvoicePayload,
  CreateInvoicePayload,
  GetInvoicesParams,
  GetInvoicesResponse,
  InvoiceDetail,
  InvoicePreview,
  InvoiceStatusHistory,
  UpdateInvoicePayload,
} from "./types";

export const invoicesApi = {
  async getInvoices(
    params: GetInvoicesParams,
    signal?: AbortSignal,
  ): Promise<GetInvoicesResponse> {
    const res = await api.get<GetInvoicesResponse>("/invoices", {
      params,
      signal,
    });
    return res.data;
  },

  async getInvoice(id: string, signal?: AbortSignal): Promise<InvoiceDetail> {
    const res = await api.get<InvoiceDetail>(`/invoices/${id}`, { signal });
    return res.data;
  },

  async previewInvoice(
    payload: CreateInvoicePayload,
    signal?: AbortSignal,
  ): Promise<InvoicePreview> {
    const res = await api.post<InvoicePreview>("/invoices/preview", payload, {
      signal,
    });
    return res.data;
  },

  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceDetail> {
    const res = await api.post<InvoiceDetail>("/invoices", payload);
    return res.data;
  },

  async updateInvoice(
    id: string,
    payload: UpdateInvoicePayload,
  ): Promise<InvoiceDetail> {
    const res = await api.patch<InvoiceDetail>(`/invoices/${id}`, payload);
    return res.data;
  },

  async cancelInvoice(
    id: string,
    payload: CancelInvoicePayload,
  ): Promise<InvoiceDetail> {
    const res = await api.post<InvoiceDetail>(
      `/invoices/${id}/cancel`,
      payload,
    );
    return res.data;
  },

  async getStatusHistories(
    id: string,
    signal?: AbortSignal,
  ): Promise<InvoiceStatusHistory[]> {
    const res = await api.get<InvoiceStatusHistory[]>(
      `/invoices/${id}/status-histories`,
      { signal },
    );
    return res.data;
  },
};
