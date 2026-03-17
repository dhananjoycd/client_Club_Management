import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { AccountProfile, UpdateAccountProfilePayload } from "@/types/account.types";

export const accountService = {
  async getProfile() {
    const { data } = await api.get<ApiResponse<AccountProfile>>("/account/profile");
    return data;
  },

  async updateProfile(payload: UpdateAccountProfilePayload) {
    const { data } = await api.patch<ApiResponse<AccountProfile>>("/account/profile", payload);
    return data;
  },
};
