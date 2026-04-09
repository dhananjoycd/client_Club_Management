import { SiteCommitteeMember, SiteSettings } from "@/types/settings.types";

type ApiResponseShape = {
  data?: SiteSettings | null;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.trim();
}

function sanitizeCommitteeMembers(
  members: SiteCommitteeMember[] | null | undefined,
) {
  if (!Array.isArray(members)) {
    return [];
  }

  return members
    .filter((member) => member?.name && member?.role)
    .map((member) => ({
      name: member.name.trim(),
      role: member.role.trim(),
      department: member.department?.trim() || "General",
    }));
}

export async function getAiCommitteeSnapshot() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const response = await fetch(`${baseUrl}/settings`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load committee data for AI: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponseShape;
  return sanitizeCommitteeMembers(payload?.data?.committeeMembers);
}
