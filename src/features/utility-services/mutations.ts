import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import { leaseUtilityServiceKeys } from "@/features/lease-utility-services/queries";
import { ApiError } from "@/lib/axios";
import { utilityServicesApi } from "./api";
import { utilityServiceKeys } from "./queries";
import {
  CreateUtilityServicePayload,
  UpdateUtilityServicePayload,
  UtilityService,
} from "./types";

function invalidateServiceLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: utilityServiceKeys.lists() });
  queryClient.invalidateQueries({ queryKey: leaseUtilityServiceKeys.all });
}

function refetchListsOnNotFound(queryClient: QueryClient, error: ApiError) {
  if (error.status === HttpStatus.NotFound) {
    queryClient.invalidateQueries({ queryKey: utilityServiceKeys.lists() });
  }
}

export function useCreateUtilityService() {
  const queryClient = useQueryClient();

  return useMutation<UtilityService, ApiError, CreateUtilityServicePayload>({
    mutationFn: (payload) => utilityServicesApi.createUtilityService(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: utilityServiceKeys.lists() });
    },
  });
}

export function useUpdateUtilityService() {
  const queryClient = useQueryClient();

  return useMutation<
    UtilityService,
    ApiError,
    { id: string; payload: UpdateUtilityServicePayload }
  >({
    mutationFn: ({ id, payload }) =>
      utilityServicesApi.updateUtilityService(id, payload),
    onSuccess(data) {
      queryClient.setQueryData(utilityServiceKeys.detail(data.id), data);
      queryClient.setQueriesData<UtilityService[]>(
        { queryKey: utilityServiceKeys.lists() },
        (services) =>
          services?.map((service) => (service.id === data.id ? data : service)),
      );
      invalidateServiceLists(queryClient);
    },
    onError(error) {
      refetchListsOnNotFound(queryClient, error);
    },
  });
}

export function useDeleteUtilityService() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => utilityServicesApi.deleteUtilityService(id),
    onSuccess(_data, id) {
      queryClient.removeQueries({ queryKey: utilityServiceKeys.detail(id) });
      invalidateServiceLists(queryClient);
    },
    onError(error) {
      refetchListsOnNotFound(queryClient, error);
    },
  });
}
