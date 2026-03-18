import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { UpdateUserRolePayload, UserDetails, UserListResponse } from "@/types/user.types";

export const userService = {
  async getUsers(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<UserListResponse>>("/users", { params });
    return data;
  },

  async getUserById(id: string) {
    const { data } = await api.get<ApiResponse<UserDetails>>(`/users/${id}`);
    return data;
  },

  async updateUserRole(id: string, payload: UpdateUserRolePayload) {
    const { data } = await api.patch<ApiResponse<{ id: string; name?: string | null; email: string; role: string }>>(`/users/${id}/role`, payload);
    return data;
  },
};
