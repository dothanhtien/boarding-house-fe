import {
  type QueryClient,
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import { leaseKeys } from "@/features/leases/queries";
import { utilityServiceKeys } from "@/features/utility-services/queries";
import { ApiError } from "@/lib/axios";
import { leaseUtilityServicesApi } from "./api";
import { leaseUtilityServiceKeys } from "./queries";
import { LeaseUtilityService, UpsertLeaseUtilityServicePayload } from "./types";

type LeaseServiceTarget = { leaseId: string; serviceId: string };

function refetchOnStaleState(
  queryClient: QueryClient,
  error: ApiError,
  leaseId: string,
) {
  if (error.status === HttpStatus.Conflict) {
    queryClient.invalidateQueries({ queryKey: leaseKeys.detail(leaseId) });
    queryClient.invalidateQueries({
      queryKey: leaseUtilityServiceKeys.list(leaseId),
    });
  } else if (error.status === HttpStatus.NotFound) {
    queryClient.invalidateQueries({ queryKey: utilityServiceKeys.lists() });
    queryClient.invalidateQueries({
      queryKey: leaseUtilityServiceKeys.list(leaseId),
    });
  }
}

const upsertMutationKey = [...leaseUtilityServiceKeys.all, "upsert"] as const;

export function usePendingLeaseServiceIds(leaseId: string) {
  return useMutationState({
    filters: {
      mutationKey: upsertMutationKey,
      status: "pending",
      predicate: (mutation) =>
        (mutation.state.variables as LeaseServiceTarget).leaseId === leaseId,
    },
    select: (mutation) =>
      (mutation.state.variables as LeaseServiceTarget).serviceId,
  });
}

export function useUpsertLeaseUtilityService() {
  const queryClient = useQueryClient();

  return useMutation<
    LeaseUtilityService,
    ApiError,
    LeaseServiceTarget & { payload: UpsertLeaseUtilityServicePayload }
  >({
    mutationKey: upsertMutationKey,
    mutationFn: ({ leaseId, serviceId, payload }) =>
      leaseUtilityServicesApi.upsertLeaseUtilityService(
        leaseId,
        serviceId,
        payload,
      ),
    onSuccess(data, { leaseId }) {
      queryClient.setQueryData<LeaseUtilityService[]>(
        leaseUtilityServiceKeys.list(leaseId),
        (services) => {
          if (!services) return services;
          const exists = services.some((s) => s.serviceId === data.serviceId);
          return exists
            ? services.map((s) => (s.serviceId === data.serviceId ? data : s))
            : [...services, data].sort((a, b) => a.name.localeCompare(b.name));
        },
      );
    },
    onError(error, { leaseId }) {
      refetchOnStaleState(queryClient, error, leaseId);
    },
  });
}

export function useRemoveLeaseUtilityService() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, LeaseServiceTarget>({
    mutationFn: ({ leaseId, serviceId }) =>
      leaseUtilityServicesApi.removeLeaseUtilityService(leaseId, serviceId),
    onSuccess(_data, { leaseId, serviceId }) {
      queryClient.setQueryData<LeaseUtilityService[]>(
        leaseUtilityServiceKeys.list(leaseId),
        (services) => services?.filter((s) => s.serviceId !== serviceId),
      );
    },
    onError(error, { leaseId }) {
      refetchOnStaleState(queryClient, error, leaseId);
    },
  });
}
