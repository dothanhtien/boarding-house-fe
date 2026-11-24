import { useQuery } from "@tanstack/react-query";
import { invoiceKeys } from "@/features/invoices/queries";
import type { ApiError } from "@/lib/axios";
import { vietQrApi } from "./api";
import type { InvoicePaymentQr } from "./types";

export const vietQrBankKeys = {
  all: ["vietqr-banks"] as const,
};

export function useVietQrBanks() {
  return useQuery({
    queryKey: vietQrBankKeys.all,
    queryFn: ({ signal }) => vietQrApi.getBanks(signal),
    staleTime: Infinity,
  });
}

export function useInvoicePaymentQr(
  invoiceId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery<InvoicePaymentQr, ApiError>({
    queryKey: invoiceKeys.paymentQr(invoiceId),
    queryFn: ({ signal }) => vietQrApi.getInvoicePaymentQr(invoiceId, signal),
    enabled: options.enabled ?? true,
    staleTime: 0,
    retry: false,
  });
}
