import { api } from "@/lib/axios";
import type { GetUsersParams, GetUsersResponse } from "./types";

export const usersApi = {
  async getUsers(
    params: GetUsersParams,
    signal?: AbortSignal,
  ): Promise<GetUsersResponse> {
    const res = await api.get<GetUsersResponse>("/users", { params, signal });
    return res.data;
  },
};
