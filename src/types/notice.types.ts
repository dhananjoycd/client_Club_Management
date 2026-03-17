export type NoticeAudience =
  | "ALL"
  | "USERS"
  | "APPLICANTS"
  | "MEMBERS"
  | "EVENT_MANAGERS"
  | "ADMINS";

export type NoticeItem = {
  id: string;
  title: string;
  content: string;
  audience: NoticeAudience;
  createdAt: string;
  updatedAt: string;
};
