import { authApi } from "./api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/axios";
import type { LoginPayload, LoginResponse } from "./types";
import { authKeys } from "./queries";
import { clearSessionMarker, setSessionMarker } from "@/utils/sessionMarker";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
      setSessionMarker();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      clearSessionMarker();
    },
  });
}
