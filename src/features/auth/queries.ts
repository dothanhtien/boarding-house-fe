import { useQuery } from "@tanstack/react-query";
import { authApi } from "./api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

interface UseMeOptions {
  refetchOnMount?: boolean | "always";
}

export function useMe(options: UseMeOptions = {}) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnWindowFocus: false,
  });
}
