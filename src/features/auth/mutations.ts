import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { authKeys } from "./queries";
import type { LoginPayload, LoginResponse } from "./types";
import type { ApiError } from "@/lib/axios";
import { useOrganizationStore } from "@/store/organizationStore";
import { clearSessionMarker, setSessionMarker } from "@/utils/sessionMarker";

let loggingOut = false;

export function consumeLoggingOut() {
  const value = loggingOut;
  loggingOut = false;
  return value;
}

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
    mutationFn: () => {
      loggingOut = true;
      return authApi.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      clearSessionMarker();
      useOrganizationStore.getState().clearSelectedOrganizationId();
    },
    onError: () => {
      loggingOut = false;
    },
  });
}
