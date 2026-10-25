import { api } from "@/lib/axios";
import type {
  CreateTenantPayload,
  LookupTenantParams,
  Tenant,
  TenantLookupResult,
} from "./types";

export const tenantsApi = {
  async lookupTenant(params: LookupTenantParams): Promise<TenantLookupResult> {
    const res = await api.get<TenantLookupResult>("/tenants/lookup", {
      params,
    });
    return res.data;
  },

  async createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    const res = await api.post<Tenant>("/tenants", payload);
    return res.data;
  },
};
