import { api } from "@/lib/axios";
import type {
  CreateUserPayload,
  GetUsersParams,
  GetUsersResponse,
  User,
} from "./types";

export const usersApi = {
  async getUsers(
    params: GetUsersParams,
    signal?: AbortSignal,
  ): Promise<GetUsersResponse> {
    const res = await api.get<GetUsersResponse>("/users", { params, signal });
    return res.data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await api.post<User>("/users", payload);
    return res.data;
  },
};
