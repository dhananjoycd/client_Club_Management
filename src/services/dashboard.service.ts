import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { DashboardAdminData, DashboardMemberData } from "@/types/dashboard.types";

export const dashboardService = {
  async getAdminDashboard() {
    const { data } = await api.get<ApiResponse<DashboardAdminData>>("/dashboard/admin");
    return data;
  },

  async getMemberDashboard() {
    const { data } = await api.get<ApiResponse<DashboardMemberData>>("/dashboard/member");
    return data;
  },
};
