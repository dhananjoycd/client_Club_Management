import { api } from "@/lib/axios";
import { ApiListData, ApiResponse } from "@/types/api.types";
import { MemberProfile, UpdateMemberPayload } from "@/types/member.types";

export const memberService = {
  async getMembers(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<ApiListData<MemberProfile>>>("/members", {
      params,
    });
    return data;
  },

  async getMemberById(id: string) {
    const { data } = await api.get<ApiResponse<MemberProfile>>(`/members/${id}`);
    return data;
  },

  async updateMember(id: string, payload: UpdateMemberPayload) {
    const { data } = await api.patch<ApiResponse<MemberProfile>>(`/members/${id}`, payload);
    return data;
  },
};
