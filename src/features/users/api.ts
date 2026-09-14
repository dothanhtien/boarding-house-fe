import { api } from "@/lib/axios";
import type {
  CreateUserPayload,
  GetUsersParams,
  GetUsersResponse,
  UpdateUserPayload,
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

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await api.patch<User>(`/users/${id}`, payload);
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
