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

export type GetUsersParams = {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "desc" | "asc";
  page?: number;
  pageSize?: number;
};

export type GetUsersResponse = {
  items: User[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

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
