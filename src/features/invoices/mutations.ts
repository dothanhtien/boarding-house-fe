import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import { paymentKeys } from "@/features/payments/queries";
import { utilityReadingKeys } from "@/features/utility-readings/queries";
import type { ApiError } from "@/lib/axios";
import { invoicesApi } from "./api";
import { invoiceKeys } from "./queries";
import type {
  CancelInvoicePayload,
  CreateInvoicePayload,
  InvoiceDetail,
  UpdateInvoicePayload,
} from "./types";

async function onInvoiceChanged(
  queryClient: QueryClient,
  invoice: InvoiceDetail,
) {
  const detailKey = invoiceKeys.detail(invoice.id);
  await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
  queryClient.setQueryData(detailKey, invoice);
  queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
  queryClient.invalidateQueries({
    queryKey: invoiceKeys.statusHistories(invoice.id),
  });
  queryClient.invalidateQueries({
    queryKey: invoiceKeys.paymentQr(invoice.id),
  });
  queryClient.removeQueries({ queryKey: invoiceKeys.previews() });
}

function onInvoiceChangeFailed(
  queryClient: QueryClient,
  error: ApiError,
  id: string,
) {
  if (
    error.status === HttpStatus.NotFound ||
    error.status === HttpStatus.Conflict
  ) {
    queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
  }
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<InvoiceDetail, ApiError, CreateInvoicePayload>({
    mutationFn: (payload) => invoicesApi.createInvoice(payload),
    async onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: utilityReadingKeys.all });
      await onInvoiceChanged(queryClient, data);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<
    InvoiceDetail,
    ApiError,
    { id: string; payload: UpdateInvoicePayload }
  >({
    mutationFn: ({ id, payload }) => invoicesApi.updateInvoice(id, payload),
    onSuccess: (data) => onInvoiceChanged(queryClient, data),
    onError: (error, { id }) => onInvoiceChangeFailed(queryClient, error, id),
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation<
    InvoiceDetail,
    ApiError,
    { id: string; payload: CancelInvoicePayload }
  >({
    mutationFn: ({ id, payload }) => invoicesApi.cancelInvoice(id, payload),
    async onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: utilityReadingKeys.all });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.byInvoice(data.id),
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      await onInvoiceChanged(queryClient, data);
    },
    onError: (error, { id }) => onInvoiceChangeFailed(queryClient, error, id),
  });
}
