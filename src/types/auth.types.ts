export type AuthRole = "USER" | "SUPER_ADMIN" | "ADMIN" | "EVENT_MANAGER" | "MEMBER" | string;

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  role: AuthRole;
  image?: string | null;
};

export type AuthSession = {
  session: {
    id: string;
    userId: string;
    expiresAt?: string;
  };
  user: AuthUser;
} | null;
