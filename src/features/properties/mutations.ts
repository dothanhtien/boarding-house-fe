import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import { propertiesApi } from "./api";
import { propertyKeys } from "./queries";
import {
  CreatePropertyPayload,
  Property,
  UpdatePropertyPayload,
} from "./types";

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation<Property, ApiError, CreatePropertyPayload>({
    mutationFn: (payload) => propertiesApi.createProperty(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation<
    Property,
    ApiError,
    { id: string; payload: UpdatePropertyPayload }
  >({
    mutationFn: ({ id, payload }) => propertiesApi.updateProperty(id, payload),
    onSuccess(_, { id }) {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => propertiesApi.deleteProperty(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.lists(),
        refetchType: "none",
      });
    },
  });
}
