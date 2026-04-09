import { EventItem } from "@/types/event.types";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.trim();
}

export async function getAiEventCatalog(): Promise<EventItem[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const response = await fetch(`${baseUrl}/events?limit=100`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load events for AI recommendations: ${response.status}`);
  }

  const data = await response.json() as { data?: { result?: EventItem[] } };
  return data?.data?.result ?? [];
}
