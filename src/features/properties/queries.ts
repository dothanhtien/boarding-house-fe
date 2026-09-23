import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propertiesApi } from "./api";
import { GetPropertiesParams } from "./types";

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params: GetPropertiesParams) =>
    [...propertyKeys.lists(), params] as const,
  detail: (id: string) => [...propertyKeys.all, "detail", id] as const,
};

export function useProperties(params: GetPropertiesParams) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: ({ signal }) => propertiesApi.getProperties(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: ({ signal }) => propertiesApi.getProperty(id, signal),
  });
}
