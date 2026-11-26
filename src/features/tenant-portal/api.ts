import type { InvoicePaymentQr } from "@/features/vietqr/types";
import { api } from "@/lib/axios";
import type {
  GetMyInvoicesParams,
  GetMyInvoicesResponse,
  GetMyLeasesParams,
  GetMyLeasesResponse,
  GetMyPaymentsParams,
  GetMyPaymentsResponse,
  GetMyUtilityReadingsParams,
  GetMyUtilityReadingsResponse,
  MyInvoiceDetail,
  MyLeaseDetail,
  Tenancy,
} from "./types";

export const tenantPortalApi = {
  async getTenancy(signal?: AbortSignal): Promise<Tenancy> {
    const res = await api.get<Tenancy>("/me/tenancy", { signal });
    return res.data;
  },

  async getLeases(
    params: GetMyLeasesParams,
    signal?: AbortSignal,
  ): Promise<GetMyLeasesResponse> {
    const res = await api.get<GetMyLeasesResponse>("/me/leases", {
      params,
      signal,
    });
    return res.data;
  },

  async getLease(id: string, signal?: AbortSignal): Promise<MyLeaseDetail> {
    const res = await api.get<MyLeaseDetail>(`/me/leases/${id}`, { signal });
    return res.data;
  },

  async getUtilityReadings(
    leaseId: string,
    params: GetMyUtilityReadingsParams,
    signal?: AbortSignal,
  ): Promise<GetMyUtilityReadingsResponse> {
    const res = await api.get<GetMyUtilityReadingsResponse>(
      `/me/leases/${leaseId}/utility-readings`,
      { params, signal },
    );
    return res.data;
  },

  async getInvoices(
    params: GetMyInvoicesParams,
    signal?: AbortSignal,
  ): Promise<GetMyInvoicesResponse> {
    const res = await api.get<GetMyInvoicesResponse>("/me/invoices", {
      params,
      signal,
    });
    return res.data;
  },

  async getInvoice(id: string, signal?: AbortSignal): Promise<MyInvoiceDetail> {
    const res = await api.get<MyInvoiceDetail>(`/me/invoices/${id}`, {
      signal,
    });
    return res.data;
  },

  async getInvoicePaymentQr(
    id: string,
    signal?: AbortSignal,
  ): Promise<InvoicePaymentQr> {
    const res = await api.get<InvoicePaymentQr>(
      `/me/invoices/${id}/payment-qr`,
      { signal },
    );
    return res.data;
  },

  async getPayments(
    params: GetMyPaymentsParams,
    signal?: AbortSignal,
  ): Promise<GetMyPaymentsResponse> {
    const res = await api.get<GetMyPaymentsResponse>("/me/payments", {
      params,
      signal,
    });
    return res.data;
  },
};
