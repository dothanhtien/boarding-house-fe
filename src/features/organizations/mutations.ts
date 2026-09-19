import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import { organizationsApi } from "./api";
import { organizationKeys } from "./queries";
import {
  CreateOrganizationPayload,
  Organization,
  OrganizationSettings,
  UpdateOrganizationPayload,
  UpdateOrganizationSettingsPayload,
} from "./types";

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<Organization, ApiError, CreateOrganizationPayload>({
    mutationFn: (payload) => organizationsApi.createOrganization(payload),
    onSuccess(data) {
      queryClient.setQueryData(organizationKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<
    Organization,
    ApiError,
    { id: string; payload: UpdateOrganizationPayload }
  >({
    mutationFn: ({ id, payload }) =>
      organizationsApi.updateOrganization(id, payload),
    onSuccess(data, { id }) {
      queryClient.setQueryData(organizationKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => organizationsApi.deleteOrganization(id),
    onSuccess(_data, id) {
      queryClient.removeQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.removeQueries({ queryKey: organizationKeys.settings(id) });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
        refetchType: "none",
      });
    },
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();

  return useMutation<
    OrganizationSettings,
    ApiError,
    { id: string; payload: UpdateOrganizationSettingsPayload }
  >({
    mutationFn: ({ id, payload }) =>
      organizationsApi.updateOrganizationSettings(id, payload),
    onSuccess(data, { id }) {
      queryClient.setQueryData(organizationKeys.settings(id), data);
    },
  });
}
