import { AiAboutSnapshot } from "@/lib/ai/types";
import { SiteSettings } from "@/types/settings.types";

type SettingsResponseShape = {
  data?: SiteSettings | null;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.trim();
}

export async function getAiAboutSnapshot(): Promise<AiAboutSnapshot | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl}/settings`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load public settings for AI: ${response.status}`);
  }

  const payload = (await response.json()) as SettingsResponseShape;
  const settings = payload?.data;
  if (!settings) {
    return null;
  }

  return {
    organizationName: settings.organizationName?.trim() || "XYZ Tech Club",
    contactEmail: settings.contactEmail?.trim() || undefined,
    phone: settings.phone?.trim() || undefined,
    aboutText: settings.aboutText?.trim() || undefined,
    mission: settings.aboutMission?.trim() || undefined,
    vision: settings.aboutVision?.trim() || undefined,
    collaboration: settings.aboutCollaboration?.trim() || undefined,
    faqs: (settings.faqs ?? [])
      .filter((item) => item?.question?.trim() && item?.answer?.trim())
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .slice(0, 6),
  };
}
