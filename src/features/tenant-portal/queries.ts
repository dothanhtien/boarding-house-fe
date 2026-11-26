import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { InvoicePaymentQr } from "@/features/vietqr/types";
import type { ApiError } from "@/lib/axios";
import { tenantPortalApi } from "./api";
import type {
  GetMyInvoicesParams,
  GetMyLeasesParams,
  GetMyPaymentsParams,
  GetMyUtilityReadingsParams,
  MyInvoiceDetail,
  MyLeaseDetail,
  Tenancy,
} from "./types";

export const tenantPortalKeys = {
  all: ["tenant-portal"] as const,
  tenancy: () => [...tenantPortalKeys.all, "tenancy"] as const,
  leases: (params: GetMyLeasesParams) =>
    [...tenantPortalKeys.all, "leases", params] as const,
  lease: (id: string) => [...tenantPortalKeys.all, "lease", id] as const,
  utilityReadings: (leaseId: string, params: GetMyUtilityReadingsParams) =>
    [...tenantPortalKeys.lease(leaseId), "utility-readings", params] as const,
  invoices: (params: GetMyInvoicesParams) =>
    [...tenantPortalKeys.all, "invoices", params] as const,
  invoice: (id: string) => [...tenantPortalKeys.all, "invoice", id] as const,
  invoicePaymentQr: (id: string) =>
    [...tenantPortalKeys.invoice(id), "payment-qr"] as const,
  payments: (params: GetMyPaymentsParams) =>
    [...tenantPortalKeys.all, "payments", params] as const,
};

export const tenancyQueryOptions = queryOptions<Tenancy, ApiError>({
  queryKey: tenantPortalKeys.tenancy(),
  queryFn: ({ signal }) => tenantPortalApi.getTenancy(signal),
  staleTime: 60 * 1000,
  retry: false,
  refetchOnWindowFocus: false,
});

export function useTenancy(options: { enabled?: boolean } = {}) {
  return useQuery({
    ...tenancyQueryOptions,
    enabled: options.enabled ?? true,
  });
}

export function useMyLeases(
  params: GetMyLeasesParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: tenantPortalKeys.leases(params),
    queryFn: ({ signal }) => tenantPortalApi.getLeases(params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useMyLease(id: string) {
  return useQuery<MyLeaseDetail, ApiError>({
    queryKey: tenantPortalKeys.lease(id),
    queryFn: ({ signal }) => tenantPortalApi.getLease(id, signal),
    retry: false,
  });
}

export function useMyLeaseUtilityReadings(
  leaseId: string,
  params: GetMyUtilityReadingsParams,
) {
  return useQuery({
    queryKey: tenantPortalKeys.utilityReadings(leaseId, params),
    queryFn: ({ signal }) =>
      tenantPortalApi.getUtilityReadings(leaseId, params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useMyInvoices(
  params: GetMyInvoicesParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: tenantPortalKeys.invoices(params),
    queryFn: ({ signal }) => tenantPortalApi.getInvoices(params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useMyInvoice(id: string) {
  return useQuery<MyInvoiceDetail, ApiError>({
    queryKey: tenantPortalKeys.invoice(id),
    queryFn: ({ signal }) => tenantPortalApi.getInvoice(id, signal),
    retry: false,
  });
}

export function useMyInvoicePaymentQr(
  id: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery<InvoicePaymentQr, ApiError>({
    queryKey: tenantPortalKeys.invoicePaymentQr(id),
    queryFn: ({ signal }) => tenantPortalApi.getInvoicePaymentQr(id, signal),
    enabled: options.enabled ?? true,
    staleTime: 0,
    retry: false,
  });
}

export function useMyPayments(params: GetMyPaymentsParams) {
  return useQuery({
    queryKey: tenantPortalKeys.payments(params),
    queryFn: ({ signal }) => tenantPortalApi.getPayments(params, signal),
    placeholderData: keepPreviousData,
  });
}
