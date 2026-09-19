import { api } from "@/lib/axios";
import {
  CreateOrganizationPayload,
  GetOrganizationsParams,
  GetOrganizationsResponse,
  Organization,
  OrganizationSettings,
  UpdateOrganizationPayload,
  UpdateOrganizationSettingsPayload,
} from "./types";

export const organizationsApi = {
  async getOrganizations(
    params: GetOrganizationsParams,
    signal?: AbortSignal,
  ): Promise<GetOrganizationsResponse> {
    const res = await api.get<GetOrganizationsResponse>("/organizations", {
      params,
      signal,
    });
    return res.data;
  },

  async getOrganization(
    id: string,
    signal?: AbortSignal,
  ): Promise<Organization> {
    const res = await api.get<Organization>(`/organizations/${id}`, {
      signal,
    });
    return res.data;
  },

  async createOrganization(
    payload: CreateOrganizationPayload,
  ): Promise<Organization> {
    const res = await api.post<Organization>("/organizations", payload);
    return res.data;
  },

  async updateOrganization(
    id: string,
    payload: UpdateOrganizationPayload,
  ): Promise<Organization> {
    const res = await api.patch<Organization>(`/organizations/${id}`, payload);
    return res.data;
  },

  async deleteOrganization(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },

  async getOrganizationSettings(
    id: string,
    signal?: AbortSignal,
  ): Promise<OrganizationSettings> {
    const res = await api.get<OrganizationSettings>(
      `/organizations/${id}/settings`,
      { signal },
    );
    return res.data;
  },

  async updateOrganizationSettings(
    id: string,
    payload: UpdateOrganizationSettingsPayload,
  ): Promise<OrganizationSettings> {
    const res = await api.patch<OrganizationSettings>(
      `/organizations/${id}/settings`,
      payload,
    );
    return res.data;
  },
};
