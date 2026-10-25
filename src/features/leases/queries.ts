import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { leasesApi } from "./api";
import { GetLeasesParams } from "./types";

export const leaseKeys = {
  all: ["leases"] as const,
  lists: () => [...leaseKeys.all, "list"] as const,
  list: (params: GetLeasesParams) => [...leaseKeys.lists(), params] as const,
  detail: (id: string) => [...leaseKeys.all, "detail", id] as const,
};

export function useLeases(
  params: GetLeasesParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: leaseKeys.list(params),
    queryFn: ({ signal }) => leasesApi.getLeases(params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useLease(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: leaseKeys.detail(id),
    queryFn: ({ signal }) => leasesApi.getLease(id, signal),
    enabled: options.enabled ?? true,
  });
}
