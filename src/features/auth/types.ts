export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  phone: string | null;
  fullName: string;
  lastLoginAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
