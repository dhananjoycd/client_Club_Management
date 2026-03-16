import { z } from "zod";

export const settingsSchema = z.object({
  organizationName: z.string().trim().min(1, "Organization name is required."),
  logoUrl: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  contactEmail: z.string().email("Enter a valid email.").or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  aboutText: z.string().trim().optional(),
  facebook: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  linkedin: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  github: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  heroSlide1Image: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  heroSlide1Title: z.string().trim().optional(),
  heroSlide1Description: z.string().trim().optional(),
  heroSlide2Image: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  heroSlide2Title: z.string().trim().optional(),
  heroSlide2Description: z.string().trim().optional(),
  heroSlide3Image: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  heroSlide3Title: z.string().trim().optional(),
  heroSlide3Description: z.string().trim().optional(),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
