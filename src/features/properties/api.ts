import { api } from "@/lib/axios";
import {
  CreatePropertyPayload,
  GetPropertiesParams,
  GetPropertiesResponse,
  Property,
  UpdatePropertyPayload,
} from "./types";

export const propertiesApi = {
  async getProperties(
    params: GetPropertiesParams,
    signal?: AbortSignal,
  ): Promise<GetPropertiesResponse> {
    const res = await api.get<GetPropertiesResponse>("/properties", {
      params,
      signal,
    });
    return res.data;
  },

  async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    const res = await api.post<Property>("/properties", payload);
    return res.data;
  },

  async updateProperty(
    id: string,
    payload: UpdatePropertyPayload,
  ): Promise<Property> {
    const res = await api.patch<Property>(`/properties/${id}`, payload);
    return res.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },
};
