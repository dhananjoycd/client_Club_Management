import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  location: z.string().trim().min(1, "Location is required."),
  eventDate: z.string().trim().min(1, "Event date is required."),
  capacity: z.number().int().positive("Capacity must be a positive number."),
});

export type EventSchema = z.infer<typeof eventSchema>;
