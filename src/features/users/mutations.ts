import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateUserPayload, User } from "./types";
import { ApiError } from "@/lib/axios";
import { usersApi } from "./api";
import { userKeys } from "./queries";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, CreateUserPayload>({
    mutationFn: (payload) => usersApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
