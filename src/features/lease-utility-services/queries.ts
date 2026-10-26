import { useQuery } from "@tanstack/react-query";
import { leaseUtilityServicesApi } from "./api";

export const leaseUtilityServiceKeys = {
  all: ["lease-utility-services"] as const,
  list: (leaseId: string) =>
    [...leaseUtilityServiceKeys.all, "list", leaseId] as const,
};

export function useLeaseUtilityServices(
  leaseId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: leaseUtilityServiceKeys.list(leaseId),
    queryFn: ({ signal }) =>
      leaseUtilityServicesApi.getLeaseUtilityServices(leaseId, signal),
    enabled: (options.enabled ?? true) && !!leaseId,
  });
}
