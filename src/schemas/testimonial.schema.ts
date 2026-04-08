import { z } from "zod";

export const testimonialSchema = z.object({
  quote: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters so your testimonial feels specific and helpful.")
    .max(600, "Keep your testimonial within 600 characters."),
});

export type TestimonialSchema = z.infer<typeof testimonialSchema>;
