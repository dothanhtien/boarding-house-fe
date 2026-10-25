import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import { tenantsApi } from "./api";
import type {
  CreateTenantPayload,
  LookupTenantParams,
  Tenant,
  TenantLookupResult,
} from "./types";

export function useLookupTenant() {
  return useMutation<TenantLookupResult, ApiError, LookupTenantParams>({
    mutationFn: (params) => tenantsApi.lookupTenant(params),
  });
}

export function useCreateTenant() {
  return useMutation<Tenant, ApiError, CreateTenantPayload>({
    mutationFn: (payload) => tenantsApi.createTenant(payload),
  });
}
