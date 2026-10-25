import { api } from "@/lib/axios";
import {
  CreateLeasePayload,
  GetLeasesParams,
  GetLeasesResponse,
  Lease,
  TerminateLeasePayload,
  UpdateLeasePayload,
} from "./types";

export const leasesApi = {
  async getLeases(
    params: GetLeasesParams,
    signal?: AbortSignal,
  ): Promise<GetLeasesResponse> {
    const res = await api.get<GetLeasesResponse>("/leases", { params, signal });
    return res.data;
  },

  async getLease(id: string, signal?: AbortSignal): Promise<Lease> {
    const res = await api.get<Lease>(`/leases/${id}`, { signal });
    return res.data;
  },

  async createLease(payload: CreateLeasePayload): Promise<Lease> {
    const res = await api.post<Lease>("/leases", payload);
    return res.data;
  },

  async updateLease(id: string, payload: UpdateLeasePayload): Promise<Lease> {
    const res = await api.patch<Lease>(`/leases/${id}`, payload);
    return res.data;
  },

  async deleteLease(id: string): Promise<void> {
    await api.delete(`/leases/${id}`);
  },

  async activateLease(id: string): Promise<Lease> {
    const res = await api.post<Lease>(`/leases/${id}/activate`);
    return res.data;
  },

  async terminateLease(
    id: string,
    payload: TerminateLeasePayload,
  ): Promise<Lease> {
    const res = await api.post<Lease>(`/leases/${id}/terminate`, payload);
    return res.data;
  },
};
