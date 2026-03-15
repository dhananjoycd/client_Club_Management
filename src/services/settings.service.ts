import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { SiteSettings } from "@/types/settings.types";

export const settingsService = {
  async getSettings() {
    const { data } = await api.get<ApiResponse<SiteSettings | null>>("/settings");
    return data;
  },

  async upsertSettings(payload: SiteSettings) {
    const { data } = await api.put<ApiResponse<SiteSettings>>("/settings", payload);
    return data;
  },
};
