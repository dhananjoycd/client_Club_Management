import { api } from "@/lib/axios";
import { ApiListData, ApiResponse } from "@/types/api.types";
import { RegistrationItem } from "@/types/registration.types";

export const registrationService = {
  async getRegistrations(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<ApiListData<RegistrationItem>>>("/registrations", {
      params,
    });
    return data;
  },

  async verifyPayment(id: string) {
    const { data } = await api.patch<ApiResponse<RegistrationItem>>(`/registrations/${id}/verify-payment`);
    return data;
  },

  async cancelRegistration(id: string) {
    const { data } = await api.patch<ApiResponse<RegistrationItem>>(`/registrations/${id}/cancel`);
    return data;
  },
};
