import { z } from "zod";

const categoryValues = ["GENERAL", "MEMBERSHIP", "EVENTS", "PAYMENTS", "PARTNERSHIP", "TECHNICAL"] as const;

export const contactSchema = z.object({
  category: z.enum(categoryValues),
  phone: z.string().trim().min(7, "Add a valid phone number.").max(30, "Keep the phone number within 30 characters.").optional().or(z.literal("")),
  subject: z.string().trim().min(5, "Write a subject with at least 5 characters.").max(140, "Keep the subject within 140 characters."),
  message: z.string().trim().min(20, "Write at least 20 characters so the admin team can understand your request.").max(1500, "Keep the message within 1500 characters."),
});

export type ContactSchema = z.infer<typeof contactSchema>;
