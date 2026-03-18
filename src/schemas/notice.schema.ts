import { z } from "zod";

export const noticeAudienceValues = ["ALL", "USERS", "APPLICANTS", "MEMBERS", "EVENT_MANAGERS", "ADMINS"] as const;
export const NOTICE_TITLE_MAX_LENGTH = 120;
export const NOTICE_CONTENT_MAX_LENGTH = 1000;

export const noticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(NOTICE_TITLE_MAX_LENGTH, `Title cannot exceed ${NOTICE_TITLE_MAX_LENGTH} characters.`),
  content: z.string().trim().min(1, "Content is required.").max(NOTICE_CONTENT_MAX_LENGTH, `Content cannot exceed ${NOTICE_CONTENT_MAX_LENGTH} characters.`),
  audience: z.enum(noticeAudienceValues),
  sendEmail: z.boolean(),
});

export type NoticeSchema = z.infer<typeof noticeSchema>;

