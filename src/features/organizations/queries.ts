import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetOrganizationsParams } from "./types";
import { organizationsApi } from "./api";

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params: GetOrganizationsParams) =>
    [...organizationKeys.lists(), params] as const,
  detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
  settings: (id: string) => [...organizationKeys.all, "settings", id] as const,
};

export function useOrganizations(params: GetOrganizationsParams) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: ({ signal }) => organizationsApi.getOrganizations(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: ({ signal }) => organizationsApi.getOrganization(id, signal),
  });
}

export function useOrganizationSettings(id: string) {
  return useQuery({
    queryKey: organizationKeys.settings(id),
    queryFn: ({ signal }) =>
      organizationsApi.getOrganizationSettings(id, signal),
  });
}
