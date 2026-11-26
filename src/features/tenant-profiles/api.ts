import { api } from "@/lib/axios";
import type { TenantProfile, UpdateTenantProfilePayload } from "./types";

export const tenantProfilesApi = {
  async getMine(signal?: AbortSignal): Promise<TenantProfile | null> {
    const res = await api.get<TenantProfile | null>("/auth/me/tenant-profile", {
      signal,
    });
    return res.data ?? null;
  },

  async updateMine(
    payload: UpdateTenantProfilePayload,
  ): Promise<TenantProfile> {
    const res = await api.patch<TenantProfile>(
      "/auth/me/tenant-profile",
      payload,
    );
    return res.data;
  },
};
