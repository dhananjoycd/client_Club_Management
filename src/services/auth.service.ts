import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { AuthSession, LoginPayload } from "@/types/auth.types";

export const authService = {
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
};
