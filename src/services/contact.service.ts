import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { AdminContactMessagesResponse, ContactMessageItem, CreateContactMessagePayload, ReviewContactMessagePayload } from "@/types/contact.types";

export const contactService = {
  async getMyMessages() {
    const { data } = await api.get<ApiResponse<ContactMessageItem[]>>("/contacts/mine");
    return data;
  },

  async createMessage(payload: CreateContactMessagePayload) {
    const { data } = await api.post<ApiResponse<ContactMessageItem>>("/contacts", payload);
    return data;
  },

  async getAdminMessages(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<AdminContactMessagesResponse>>("/contacts/admin", { params });
    return data;
  },

  async reviewMessage(id: string, payload: ReviewContactMessagePayload) {
    const { data } = await api.patch<ApiResponse<ContactMessageItem>>(`/contacts/${id}/review`, payload);
    return data;
  },
};
