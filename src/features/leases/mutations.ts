import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import { ApiError } from "@/lib/axios";
import { leasesApi } from "./api";
import { leaseKeys } from "./queries";
import { CreateLeasePayload, Lease, UpdateLeasePayload } from "./types";

export function useCreateLease() {
  const queryClient = useQueryClient();

  return useMutation<Lease, ApiError, CreateLeasePayload>({
    mutationFn: (payload) => leasesApi.createLease(payload),
    onSuccess(data) {
      queryClient.setQueryData(leaseKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
    },
  });
}

export function useUpdateLease() {
  const queryClient = useQueryClient();

  return useMutation<
    Lease,
    ApiError,
    { id: string; payload: UpdateLeasePayload }
  >({
    mutationFn: ({ id, payload }) => leasesApi.updateLease(id, payload),
    onSuccess(data, { id }) {
      queryClient.setQueryData(leaseKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
    },
    onError(error, { id }) {
      if (
        error.status === HttpStatus.NotFound ||
        error.status === HttpStatus.Conflict
      ) {
        queryClient.invalidateQueries({ queryKey: leaseKeys.detail(id) });
      }
    },
  });
}

export function useDeleteLease() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => leasesApi.deleteLease(id),
    onSuccess(_data, id) {
      queryClient.invalidateQueries({
        queryKey: leaseKeys.detail(id),
        refetchType: "none",
      });
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
    },
    onError(error, id) {
      if (error.status === HttpStatus.Conflict) {
        queryClient.invalidateQueries({ queryKey: leaseKeys.detail(id) });
      }
    },
  });
}
