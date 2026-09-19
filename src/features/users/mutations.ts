import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import { usersApi } from "./api";
import { userKeys } from "./queries";
import { CreateUserPayload, UpdateUserPayload, User } from "./types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, CreateUserPayload>({
    mutationFn: (payload) => usersApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    ApiError,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: ({ id, payload }) => usersApi.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
        refetchType: "none",
      });
    },
  });
}
