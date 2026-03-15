export type NoticeAudience = "ALL" | "MEMBERS" | "ADMINS";

export type NoticeItem = {
  id: string;
  title: string;
  content: string;
  audience: NoticeAudience;
  createdAt: string;
};
