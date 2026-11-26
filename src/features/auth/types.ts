import { UserOrganizationMembership, UserRole } from "../users/types";

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string | null;
  emailVerifiedAt: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  platformRole: UserRole | null;
  organizations: UserOrganizationMembership[];
};

export type LoginResponse = AuthUser;
