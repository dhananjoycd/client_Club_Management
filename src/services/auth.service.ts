import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { AuthSession, LoginPayload, RegisterPayload } from "@/types/auth.types";

type BetterAuthStatusResponse = {
  status: boolean;
  message?: string;
};

type SocialSignInResponse = {
  redirect: boolean;
  url?: string;
};

export const authService = {
  async register(payload: RegisterPayload) {
    const { data } = await api.post<ApiResponse<AuthSession>>("/auth/register", payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<ApiResponse<AuthSession>>("/auth/login", payload);
    return data;
  },

  async getSession() {
    const { data } = await api.get<ApiResponse<AuthSession>>("/auth/session");
    return data;
  },

  async logout() {
    const { data } = await api.post<ApiResponse<null>>("/auth/logout");
    return data;
  },

  async requestPasswordReset(payload: { email: string; redirectTo?: string }) {
    const { data } = await api.post<BetterAuthStatusResponse>("/auth/request-password-reset", payload);
    return data;
  },

  async resetPassword(payload: { newPassword: string; token: string }) {
    const { data } = await api.post<BetterAuthStatusResponse>("/auth/reset-password", payload);
    return data;
  },

  async sendVerificationEmail(payload: { email: string; callbackURL?: string }) {
    const { data } = await api.post<BetterAuthStatusResponse>("/auth/send-verification-email", payload);
    return data;
  },

  async signInWithGoogle(payload: { callbackURL?: string; newUserCallbackURL?: string; errorCallbackURL?: string }) {
    const { data } = await api.post<SocialSignInResponse>("/auth/sign-in/social", {
      provider: "google",
      disableRedirect: true,
      ...payload,
    });
    return data;
  },
};
