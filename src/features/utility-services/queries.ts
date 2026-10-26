import { useQuery } from "@tanstack/react-query";
import { utilityServicesApi } from "./api";
import { GetUtilityServicesParams } from "./types";

export const utilityServiceKeys = {
  all: ["utility-services"] as const,
  lists: () => [...utilityServiceKeys.all, "list"] as const,
  list: (params: GetUtilityServicesParams) =>
    [...utilityServiceKeys.lists(), params] as const,
  detail: (id: string) => [...utilityServiceKeys.all, "detail", id] as const,
};

export function useUtilityServices(
  params: GetUtilityServicesParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: utilityServiceKeys.list(params),
    queryFn: ({ signal }) =>
      utilityServicesApi.getUtilityServices(params, signal),
    enabled: (options.enabled ?? true) && !!params.propertyId,
  });
}
