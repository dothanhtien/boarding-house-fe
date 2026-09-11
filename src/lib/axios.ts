import axios, { AxiosError } from "axios";

export type ApiError = {
  status: number | null;
  message: string;
  /** Field -> validation messages, when the backend returns a ProblemDetails validation error. */
  errors?: Record<string, string[]>;
};

// RFC 7807 ProblemDetails, as returned by the backend (both validation errors,
// which add `errors`, and plain errors, which only have `title`).
type ProblemDetails = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  timeout: 30_000,
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ProblemDetails>) => {
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
