import { z } from "zod";

export const noticeAudienceValues = ["ALL", "USERS", "APPLICANTS", "MEMBERS", "EVENT_MANAGERS", "ADMINS"] as const;

export const noticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
  audience: z.enum(noticeAudienceValues),
  sendEmail: z.boolean().optional().default(false),
});

export type NoticeSchema = z.infer<typeof noticeSchema>;
