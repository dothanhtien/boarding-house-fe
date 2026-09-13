import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetUsersParams } from "./types";
import { usersApi } from "./api";

export const userKeys = {
  all: ["users"] as const,
  list: (params: GetUsersParams) => [...userKeys.all, "list", params] as const,
};

export function useUsers(params: GetUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => usersApi.getUsers(params, signal),
    placeholderData: keepPreviousData,
  });
}
