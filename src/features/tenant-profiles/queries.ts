import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/axios";
import { tenantProfilesApi } from "./api";
import type { TenantProfile } from "./types";

export const tenantProfileKeys = {
  all: ["tenant-profiles"] as const,
  mine: () => [...tenantProfileKeys.all, "mine"] as const,
};

export function useMyTenantProfile() {
  return useQuery<TenantProfile | null, ApiError>({
    queryKey: tenantProfileKeys.mine(),
    queryFn: ({ signal }) => tenantProfilesApi.getMine(signal),
  });
}
