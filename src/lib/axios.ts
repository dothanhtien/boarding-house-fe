import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { HttpStatus } from "@/enums/httpStatus";
import { useOrganizationStore } from "@/store/organizationStore";

export type ApiError = {
  status: number | null;
  message: string;
  errors?: Record<string, string[]>;
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

function isApiEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    "data" in body
  );
}

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

if (
  process.env.NODE_ENV === "production" &&
  BASE_API_URL &&
  !BASE_API_URL.startsWith("https://")
) {
  throw new Error(
    `NEXT_PUBLIC_BASE_API_URL must use https:// in production (got "${BASE_API_URL}").`,
  );
}

export const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  timeout: 30_000,
});

const refreshApi = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  timeout: 30_000,
});

const SKIP_REFRESH_PATHS = [
  "/auth/login",
  "/auth/logout",
  "/auth/refresh-token",
];

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  refreshPromise ??= refreshApi
    .post("/auth/refresh-token")
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const selectedOrganizationId =
    useOrganizationStore.getState().selectedOrganizationId;
  if (selectedOrganizationId) {
    config.headers.set("X-Organization-Id", selectedOrganizationId);
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (isApiEnvelope(res.data)) {
      res.data = res.data.data;
    }
    return res;
  },
  async (error: AxiosError<ProblemDetails>) => {
    const config = error.config as RetriableConfig | undefined;
    const shouldTryRefresh =
      error.response?.status === HttpStatus.Unauthorized &&
      config &&
      !config._retried &&
      !SKIP_REFRESH_PATHS.some((p) => config.url?.startsWith(p));

    if (shouldTryRefresh) {
      config._retried = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api(config);
      }
    }

    const data = error.response?.data;
    const firstFieldMessage = data?.errors
      ? Object.values(data.errors)[0]?.[0]
      : undefined;

    const apiError: ApiError = {
      status: error.response?.status ?? null,
      message:
        firstFieldMessage ??
        data?.message ??
        data?.detail ??
        data?.title ??
        (error.code === "ECONNABORTED"
          ? "Request timed out"
          : "Something went wrong, please try again"),
      errors: data?.errors,
    };
    return Promise.reject(apiError);
  },
);
