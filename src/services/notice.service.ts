import { api } from "@/lib/axios";
import { ApiListData, ApiResponse } from "@/types/api.types";
import { NoticeSchema } from "@/schemas/notice.schema";
import { NoticeItem } from "@/types/notice.types";

export const noticeService = {
  async getNotices(params?: Record<string, string | number | boolean | undefined>) {
    const { data } = await api.get<ApiResponse<ApiListData<NoticeItem>>>("/notices", {
      params,
    });
    return data;
  },

  async createNotice(payload: NoticeSchema) {
    const { data } = await api.post<ApiResponse<NoticeItem>>("/notices", payload);
    return data;
  },

  async updateNotice(id: string, payload: Partial<NoticeSchema>) {
    const { data } = await api.patch<ApiResponse<NoticeItem>>(`/notices/${id}`, payload);
    return data;
  },

  async deleteNotice(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/notices/${id}`);
    return data;
  },
};
