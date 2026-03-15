import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
  audience: z.enum(["ALL", "MEMBERS", "ADMINS"]),
});

export type NoticeSchema = z.infer<typeof noticeSchema>;
