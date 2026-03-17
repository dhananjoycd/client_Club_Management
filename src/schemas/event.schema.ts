import { z } from "zod";

const eventCategories = ["Workshop", "Seminar", "Webinar", "Hackathon", "Competition", "Tech Talk", "Bootcamp", "Meetup"] as const;

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  location: z.string().trim().min(1, "Location is required."),
  eventDate: z.string().trim().min(1, "Event date is required."),
  capacity: z.number().int().positive("Capacity must be a positive number."),
  category: z.enum(eventCategories, { message: "Select a valid category." }).optional(),
  eventType: z.enum(["FREE", "PAID"]).default("FREE"),
  price: z.number().nonnegative("Price must be zero or more.").optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  imageUrl: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  isFeatured: z.boolean().default(false),
  isRegistrationOpen: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.eventType === "PAID" && (!value.price || value.price <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["price"], message: "Price is required for paid events." });
  }
});

export type EventSchema = z.input<typeof eventSchema>;
