import { api } from "@/lib/axios";
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
};
