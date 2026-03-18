import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  CommitteeSessionItem,
  CreateCommitteeAssignmentPayload,
  CreateCommitteeSessionPayload,
  EligibleCommitteeMember,
  PublicCommitteeResponse,
  UpdateCommitteeAssignmentPayload,
  UpdateCommitteeSessionPayload,
} from "@/types/committee.types";

export const committeeService = {
  async getPublicCommittee() {
    const { data } = await api.get<ApiResponse<PublicCommitteeResponse>>("/committee/public");
    return data;
  },

  async getAdminSessions() {
    const { data } = await api.get<ApiResponse<CommitteeSessionItem[]>>("/committee/admin/sessions");
    return data;
  },

  async getEligibleMembers() {
    const { data } = await api.get<ApiResponse<EligibleCommitteeMember[]>>("/committee/admin/eligible-members");
    return data;
  },

  async createSession(payload: CreateCommitteeSessionPayload) {
    const { data } = await api.post<ApiResponse<CommitteeSessionItem>>("/committee/sessions", payload);
    return data;
  },

  async updateSession(id: string, payload: UpdateCommitteeSessionPayload) {
    const { data } = await api.patch<ApiResponse<CommitteeSessionItem>>(`/committee/sessions/${id}`, payload);
    return data;
  },

  async deleteSession(id: string) {
    const { data } = await api.delete<ApiResponse<unknown>>(`/committee/sessions/${id}`);
    return data;
  },

  async createAssignment(payload: CreateCommitteeAssignmentPayload) {
    const { data } = await api.post<ApiResponse<unknown>>("/committee/assignments", payload);
    return data;
  },

  async updateAssignment(id: string, payload: UpdateCommitteeAssignmentPayload) {
    const { data } = await api.patch<ApiResponse<unknown>>(`/committee/assignments/${id}`, payload);
    return data;
  },

  async deleteAssignment(id: string) {
    const { data } = await api.delete<ApiResponse<unknown>>(`/committee/assignments/${id}`);
    return data;
  },
};
