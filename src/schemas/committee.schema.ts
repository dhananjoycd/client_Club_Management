import { z } from "zod";

const sessionLabelPattern = /^\d{4}-\d{2}$/;

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid image URL.")
  .optional()
  .or(z.literal(""));

export const createCommitteeSessionSchema = z
  .object({
    sessionChoice: z.string().min(1, "Select a session label."),
    customSessionLabel: z.string().trim().optional().or(z.literal("")),
    title: z.string().trim().max(120, "Keep the title within 120 characters.").optional().or(z.literal("")),
    description: z.string().trim().max(400, "Keep the description within 400 characters.").optional().or(z.literal("")),
    coverImageUrl: optionalUrl,
  })
  .superRefine((value, ctx) => {
    if (value.sessionChoice === "CUSTOM") {
      if (!value.customSessionLabel?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["customSessionLabel"],
          message: "Enter a custom session label.",
        });
        return;
      }

      if (!sessionLabelPattern.test(value.customSessionLabel.trim())) {
        ctx.addIssue({
          code: "custom",
          path: ["customSessionLabel"],
          message: "Use the format YYYY-YY, for example 2037-38.",
        });
      }
    }
  });

export const editCommitteeSessionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Session label is required.")
    .regex(sessionLabelPattern, "Use the format YYYY-YY, for example 2026-27."),
  title: z.string().trim().max(120, "Keep the title within 120 characters.").optional().or(z.literal("")),
  description: z.string().trim().max(400, "Keep the description within 400 characters.").optional().or(z.literal("")),
  coverImageUrl: optionalUrl,
});

export type CreateCommitteeSessionSchema = z.infer<typeof createCommitteeSessionSchema>;
export type EditCommitteeSessionSchema = z.infer<typeof editCommitteeSessionSchema>;
