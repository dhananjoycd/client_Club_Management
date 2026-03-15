import { z } from "zod";

export const applicationSchema = z.object({
  department: z.string().min(2, "Department is required."),
  session: z.string().min(2, "Academic session is required."),
  studentId: z.string().min(2, "Student ID is required."),
  district: z.string().min(2, "District is required."),
  phone: z.string().min(11, "Phone number must be at least 11 digits."),
});

export type ApplicationSchema = z.infer<typeof applicationSchema>;
