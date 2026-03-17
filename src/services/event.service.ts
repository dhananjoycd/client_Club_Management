import { api } from "@/lib/axios";
import { ApiListData, ApiResponse } from "@/types/api.types";
import { EventSchema } from "@/schemas/event.schema";
import { EventItem } from "@/types/event.types";
import { RegistrationItem } from "@/types/registration.types";

export type EventRegistrationResponse = {
  requiresPayment: boolean;
  checkoutUrl?: string | null;
  registration?: RegistrationItem | null;
};

export const eventService = {
  async getEvents(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<ApiListData<EventItem>>>("/events", { params });
    return data;
  },

  async getEventById(id: string) {
    const { data } = await api.get<ApiResponse<EventItem>>(`/events/${id}`);
    return data;
  },

  async registerForEvent(id: string) {
    const { data } = await api.post<ApiResponse<EventRegistrationResponse>>(`/events/${id}/register`);
    return data;
  },

  async markPaymentVerificationFailed(id: string) {
    const { data } = await api.post<ApiResponse<RegistrationItem | null>>(`/events/${id}/payment-failed`);
    return data;
  },

  async createEvent(payload: EventSchema) {
    const normalizedPayload = {
      ...payload,
      eventDate: new Date(payload.eventDate).toISOString(),
      imageUrl: payload.imageUrl || undefined,
      category: payload.category || undefined,
      currency: payload.eventType === "PAID" ? "bdt" : undefined,
      price: payload.eventType === "PAID" ? payload.price : undefined,
    };
    const { data } = await api.post<ApiResponse<EventItem>>("/events", normalizedPayload);
    return data;
  },

  async updateEvent(id: string, payload: Partial<EventSchema>) {
    const normalizedPayload = {
      ...payload,
      ...(payload.eventDate ? { eventDate: new Date(payload.eventDate).toISOString() } : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl || undefined } : {}),
      ...(payload.category !== undefined ? { category: payload.category || undefined } : {}),
      ...(payload.currency !== undefined ? { currency: "bdt" } : {}),
      ...(payload.price !== undefined ? { price: payload.price } : {}),
    };
    const { data } = await api.patch<ApiResponse<EventItem>>(`/events/${id}`, normalizedPayload);
    return data;
  },

  async deleteEvent(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/events/${id}`);
    return data;
  },
};
