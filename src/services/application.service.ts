import { api } from "@/lib/axios";
import { ApiListData, ApiResponse } from "@/types/api.types";
import {
  MembershipApplication,
  MembershipApplicationPayload,
  ReviewApplicationPayload,
} from "@/types/application.types";

export const applicationService = {
  async submitApplication(payload: MembershipApplicationPayload) {
    const { data } = await api.post<ApiResponse<MembershipApplication>>("/applications", payload);
    return data;
  },

  async getApplications(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<ApiListData<MembershipApplication>>>("/applications", {
      params,
    });
    return data;
  },

  async reviewApplication(id: string, payload: ReviewApplicationPayload) {
    const { data } = await api.patch<ApiResponse<MembershipApplication>>(`/applications/${id}/review`, payload);
    return data;
  },
};
