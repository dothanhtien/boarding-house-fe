import { ListQueryParams, PagedResult } from "@/types";

export type User = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  phone: string | null;
  fullName: string;
  lastLoginAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type GetUsersParams = ListQueryParams;

export type GetUsersResponse = PagedResult<User>;

export type CreateUserPayload = {
  email: string;
  fullName: string;
  phone?: string | null;
  password: string;
  passwordConfirmation: string;
};

export type UpdateUserPayload = Partial<
  Pick<User, "email" | "fullName" | "phone" | "isActive">
>;
