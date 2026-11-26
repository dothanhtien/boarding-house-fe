import { api } from "@/lib/axios";
import { multipartConfig, toFormData } from "@/utils/multipart";
import type { LoginPayload, LoginResponse } from "./types";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", payload);
    return res.data;
  },

  async getMe(): Promise<LoginResponse> {
    const res = await api.get<LoginResponse>("/auth/me");
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async updateMyAvatar(file: File): Promise<void> {
    await api.put(
      "/auth/me/avatar",
      toFormData({ file: [file] }),
      multipartConfig(),
    );
  },

  async deleteMyAvatar(): Promise<void> {
    await api.delete("/auth/me/avatar");
  },
};
