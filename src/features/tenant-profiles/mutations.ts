import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/axios";
import { tenantProfilesApi } from "./api";
import { tenantProfileKeys } from "./queries";
import type { TenantProfile, UpdateTenantProfilePayload } from "./types";

export function useUpdateMyTenantProfile() {
  const queryClient = useQueryClient();

  return useMutation<TenantProfile, ApiError, UpdateTenantProfilePayload>({
    mutationFn: (payload) => tenantProfilesApi.updateMine(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(tenantProfileKeys.mine(), profile);
    },
  });
}
