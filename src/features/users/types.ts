export type User = {
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

export type GetUsersParams = {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
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
