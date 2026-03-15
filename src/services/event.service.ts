import { api } from "@/lib/axios";
import { ApiListData, ApiResponse } from "@/types/api.types";
import { EventItem } from "@/types/event.types";
import { EventSchema } from "@/schemas/event.schema";

export const eventService = {
  async getEvents(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<ApiListData<EventItem>>>("/events", {
      params,
    });
    return data;
  },

  async createEvent(payload: EventSchema) {
    const normalizedPayload = {
      ...payload,
      eventDate: new Date(payload.eventDate).toISOString(),
    };

    const { data } = await api.post<ApiResponse<EventItem>>("/events", normalizedPayload);
    return data;
  },

  async updateEvent(id: string, payload: Partial<EventSchema>) {
    const normalizedPayload = {
      ...payload,
      ...(payload.eventDate ? { eventDate: new Date(payload.eventDate).toISOString() } : {}),
    };

    const { data } = await api.patch<ApiResponse<EventItem>>(`/events/${id}`, normalizedPayload);
    return data;
  },

  async deleteEvent(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/events/${id}`);
    return data;
  },
};
