import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { invoiceKeys } from "@/features/invoices/queries";
import type { ApiError } from "@/lib/axios";
import { paymentsApi } from "./api";
import { paymentKeys } from "./queries";
import type {
  Payment,
  RecordPaymentPayload,
  VoidPaymentPayload,
} from "./types";

export function invalidateAfterPaymentChange(
  queryClient: QueryClient,
  invoiceId: string,
) {
  queryClient.invalidateQueries({ queryKey: paymentKeys.byInvoice(invoiceId) });
  queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
  queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
  queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
}

function onPaymentChanged(queryClient: QueryClient, payment: Payment) {
  queryClient.setQueryData(paymentKeys.detail(payment.id), payment);
  invalidateAfterPaymentChange(queryClient, payment.invoiceId);
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation<
    Payment,
    ApiError,
    { invoiceId: string; payload: RecordPaymentPayload }
  >({
    mutationFn: ({ invoiceId, payload }) =>
      paymentsApi.recordPayment(invoiceId, payload),
    onSuccess: (data) => onPaymentChanged(queryClient, data),
    onError: (_error, { invoiceId }) =>
      invalidateAfterPaymentChange(queryClient, invoiceId),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation<Payment, ApiError, Payment>({
    mutationFn: (payment) => paymentsApi.confirmPayment(payment.id),
    onSuccess: (data) => onPaymentChanged(queryClient, data),
    onError: (_error, payment) =>
      invalidateAfterPaymentChange(queryClient, payment.invoiceId),
  });
}

export function useVoidPayment() {
  const queryClient = useQueryClient();

  return useMutation<
    Payment,
    ApiError,
    { payment: Payment; payload: VoidPaymentPayload }
  >({
    mutationFn: ({ payment, payload }) =>
      paymentsApi.voidPayment(payment.id, payload),
    onSuccess: (data) => onPaymentChanged(queryClient, data),
    onError: (_error, { payment }) =>
      invalidateAfterPaymentChange(queryClient, payment.invoiceId),
  });
}
