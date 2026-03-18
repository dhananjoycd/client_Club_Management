import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  AdminTestimonialsResponse,
  CreateTestimonialPayload,
  MyTestimonial,
  PublicTestimonial,
  ReviewTestimonialPayload,
} from "@/types/testimonial.types";

export const testimonialService = {
  async getPublicTestimonials() {
    const { data } = await api.get<ApiResponse<PublicTestimonial[]>>("/testimonials");
    return data;
  },

  async getMyTestimonials() {
    const { data } = await api.get<ApiResponse<MyTestimonial[]>>("/testimonials/mine");
    return data;
  },

  async createTestimonial(payload: CreateTestimonialPayload) {
    const { data } = await api.post<ApiResponse<MyTestimonial>>("/testimonials", payload);
    return data;
  },

  async getAdminTestimonials(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<AdminTestimonialsResponse>>("/testimonials/admin", { params });
    return data;
  },

  async reviewTestimonial(id: string, payload: ReviewTestimonialPayload) {
    const { data } = await api.patch<ApiResponse<unknown>>(`/testimonials/${id}/review`, payload);
    return data;
  },
};
