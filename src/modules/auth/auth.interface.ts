import type { UserRole } from "../users/users.interface";

export type TAuthLogin = {
  email: string;
  password: string;
};

export type TAuthSignUp = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};
