import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "./api";
import type { GetPaymentsParams } from "./types";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: GetPaymentsParams) =>
    [...paymentKeys.lists(), params] as const,
  byInvoice: (invoiceId: string) =>
    [...paymentKeys.all, "by-invoice", invoiceId] as const,
  detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
};

export function usePayments(
  params: GetPaymentsParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: ({ signal }) => paymentsApi.getPayments(params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: paymentKeys.byInvoice(invoiceId),
    queryFn: ({ signal }) => paymentsApi.getInvoicePayments(invoiceId, signal),
  });
}
