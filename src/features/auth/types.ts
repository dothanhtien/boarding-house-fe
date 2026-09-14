import { User } from "../users/types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = User;
