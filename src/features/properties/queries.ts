import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propertiesApi } from "./api";
import { GetPropertiesParams } from "./types";

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params: GetPropertiesParams) =>
    [...propertyKeys.lists(), params] as const,
};

export function useProperties(params: GetPropertiesParams) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: ({ signal }) => propertiesApi.getProperties(params, signal),
    placeholderData: keepPreviousData,
  });
}
