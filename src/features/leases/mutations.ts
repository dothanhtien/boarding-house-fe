import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import { roomKeys } from "@/features/rooms/queries";
import { ApiError } from "@/lib/axios";
import { leasesApi } from "./api";
import { leaseKeys } from "./queries";
import {
  CreateLeasePayload,
  Lease,
  TerminateLeasePayload,
  UpdateLeasePayload,
} from "./types";

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

function useLeaseStatusChangeCache() {
  const queryClient = useQueryClient();

  return {
    onChanged(lease: Lease) {
      queryClient.setQueryData(leaseKeys.detail(lease.id), lease);
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(lease.roomId),
      });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
    onFailed(error: ApiError, lease: Lease) {
      if (
        error.status === HttpStatus.NotFound ||
        error.status === HttpStatus.Conflict
      ) {
        queryClient.invalidateQueries({ queryKey: leaseKeys.detail(lease.id) });
        queryClient.invalidateQueries({
          queryKey: roomKeys.detail(lease.roomId),
        });
      }
    },
  };
}

export function useActivateLease() {
  const cache = useLeaseStatusChangeCache();

  return useMutation<Lease, ApiError, Lease>({
    mutationFn: (lease) => leasesApi.activateLease(lease.id),
    onSuccess: (data) => cache.onChanged(data),
    onError: (error, lease) => cache.onFailed(error, lease),
  });
}

export function useTerminateLease() {
  const cache = useLeaseStatusChangeCache();

  return useMutation<
    Lease,
    ApiError,
    { lease: Lease; payload: TerminateLeasePayload }
  >({
    mutationFn: ({ lease, payload }) =>
      leasesApi.terminateLease(lease.id, payload),
    onSuccess: (data) => cache.onChanged(data),
    onError: (error, { lease }) => cache.onFailed(error, lease),
  });
}
