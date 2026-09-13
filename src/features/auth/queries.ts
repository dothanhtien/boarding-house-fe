import { useQuery } from "@tanstack/react-query";
import { authApi } from "./api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}
