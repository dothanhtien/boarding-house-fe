import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/axios";
import { invoicesApi } from "./api";
import type {
  CreateInvoicePayload,
  GetInvoicesParams,
  InvoicePreview,
} from "./types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: GetInvoicesParams) =>
    [...invoiceKeys.lists(), params] as const,
  detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
  statusHistories: (id: string) =>
    [...invoiceKeys.detail(id), "status-histories"] as const,
  paymentQr: (id: string) => [...invoiceKeys.detail(id), "payment-qr"] as const,
  previews: () => [...invoiceKeys.all, "preview"] as const,
  preview: (payload: CreateInvoicePayload | null) =>
    [...invoiceKeys.previews(), payload] as const,
};

export function useInvoices(
  params: GetInvoicesParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: ({ signal }) => invoicesApi.getInvoices(params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useInvoice(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: ({ signal }) => invoicesApi.getInvoice(id, signal),
    enabled: options.enabled ?? true,
  });
}

export function useInvoicePreview(payload: CreateInvoicePayload | null) {
  return useQuery<InvoicePreview, ApiError>({
    queryKey: invoiceKeys.preview(payload),
    queryFn: ({ signal }) => invoicesApi.previewInvoice(payload!, signal),
    enabled: payload !== null,
    placeholderData: keepPreviousData,
    staleTime: 0,
    retry: false,
  });
}

export function useInvoiceStatusHistories(id: string) {
  return useQuery({
    queryKey: invoiceKeys.statusHistories(id),
    queryFn: ({ signal }) => invoicesApi.getStatusHistories(id, signal),
  });
}
