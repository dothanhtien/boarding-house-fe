import { api } from "@/lib/axios";
import {
  CreateUtilityServicePayload,
  GetUtilityServicesParams,
  UpdateUtilityServicePayload,
  UtilityService,
} from "./types";

export const utilityServicesApi = {
  async getUtilityServices(
    params: GetUtilityServicesParams,
    signal?: AbortSignal,
  ): Promise<UtilityService[]> {
    const res = await api.get<UtilityService[]>("/utility-services", {
      params,
      signal,
    });

    return res.data;
  },

  async getUtilityService(
    id: string,
    signal?: AbortSignal,
  ): Promise<UtilityService> {
    const res = await api.get<UtilityService>(`/utility-services/${id}`, {
      signal,
    });

    return res.data;
  },

  async createUtilityService(
    payload: CreateUtilityServicePayload,
  ): Promise<UtilityService> {
    const res = await api.post<UtilityService>("/utility-services", payload);

    return res.data;
  },

  async updateUtilityService(
    id: string,
    payload: UpdateUtilityServicePayload,
  ): Promise<UtilityService> {
    const res = await api.patch<UtilityService>(
      `/utility-services/${id}`,
      payload,
    );

    return res.data;
  },

  async deleteUtilityService(id: string): Promise<void> {
    await api.delete(`/utility-services/${id}`);
  },
};
