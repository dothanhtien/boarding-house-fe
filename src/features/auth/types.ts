import { UserOrganizationMembership, UserRole } from "../users/types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  phone: string | null;
  fullName: string;
  lastLoginAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  platformRole: UserRole | null;
  organizations: UserOrganizationMembership[];
};

export type LoginResponse = AuthUser;
