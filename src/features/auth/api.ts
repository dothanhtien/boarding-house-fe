import { api } from "@/lib/axios";
import type { LoginPayload, LoginResponse } from "./types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
}
