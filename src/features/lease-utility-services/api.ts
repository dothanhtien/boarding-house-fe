import { api } from "@/lib/axios";
import { LeaseUtilityService, UpsertLeaseUtilityServicePayload } from "./types";

export const leaseUtilityServicesApi = {
  async getLeaseUtilityServices(
    leaseId: string,
    signal?: AbortSignal,
  ): Promise<LeaseUtilityService[]> {
    const res = await api.get<LeaseUtilityService[]>(
      `/leases/${leaseId}/utility-services`,
      { signal },
    );

    return res.data;
  },

  async upsertLeaseUtilityService(
    leaseId: string,
    serviceId: string,
    payload: UpsertLeaseUtilityServicePayload,
  ): Promise<LeaseUtilityService> {
    const res = await api.put<LeaseUtilityService>(
      `/leases/${leaseId}/utility-services/${serviceId}`,
      payload,
    );

    return res.data;
  },

  async removeLeaseUtilityService(
    leaseId: string,
    serviceId: string,
  ): Promise<void> {
    await api.delete(`/leases/${leaseId}/utility-services/${serviceId}`);
  },
};
