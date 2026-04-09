import { EventItem, eventCategories } from "@/types/event.types";
import { AiAssistantEventRecommendation } from "@/lib/ai/types";

const eventIntentKeywords = [
  "event",
  "events",
  "workshop",
  "seminar",
  "webinar",
  "hackathon",
  "competition",
  "bootcamp",
  "meetup",
  "tech talk",
  "register",
  "registration",
  "paid",
  "free",
  "upcoming",
  "past",
  "join",
  "session",
];

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function isEventIntent(message: string) {
  const lower = message.toLowerCase();
  return eventIntentKeywords.some((keyword) => lower.includes(keyword));
}

function getCategoryMatches(message: string) {
  const lower = message.toLowerCase();
  return eventCategories.filter((category) => lower.includes(category.toLowerCase()));
}

function buildReason(event: EventItem, message: string) {
  const lower = message.toLowerCase();
  const parts: string[] = [];

  if (lower.includes("free") && event.eventType === "FREE") {
    parts.push("matches your request for a free event");
  }
  if (lower.includes("paid") && event.eventType === "PAID") {
    parts.push("matches your request for a paid event");
  }
  if (lower.includes("upcoming") && new Date(event.eventDate).getTime() >= Date.now()) {
    parts.push("it is upcoming");
  }
  if (event.category && lower.includes(event.category.toLowerCase())) {
    parts.push(`fits the ${event.category} category`);
  }

  return parts.length ? `Recommended because it ${parts.join(" and ")}.` : "Recommended based on your current event question.";
}

function scoreEvent(event: EventItem, message: string) {
  const lower = message.toLowerCase();
  const tokens = tokenize(message);
  const haystack = [event.title, event.description, event.location, event.category ?? "", event.eventType ?? "FREE"].join(" ").toLowerCase();
  let score = 0;

  if (lower.includes("free") && event.eventType === "FREE") score += 6;
  if (lower.includes("paid") && event.eventType === "PAID") score += 6;

  const isUpcoming = new Date(event.eventDate).getTime() >= Date.now();
  if (lower.includes("upcoming") && isUpcoming) score += 5;
  if (lower.includes("past") && !isUpcoming) score += 5;

  const categoryMatches = getCategoryMatches(message);
  if (categoryMatches.length && event.category && categoryMatches.includes(event.category)) {
    score += 7;
  }

  score += tokens.reduce((total, token) => total + (haystack.includes(token) ? 2 : 0), 0);

  if (event.isRegistrationOpen !== false) score += 1;
  if (event.isFeatured) score += 1;

  return score;
}

export function createEventRecommendations(message: string, events: EventItem[]): AiAssistantEventRecommendation[] {
  if (!isEventIntent(message)) {
    return [];
  }

  const now = Date.now();
  const scored = events
    .map((event) => ({
      event,
      score: scoreEvent(event, message),
      isUpcoming: new Date(event.eventDate).getTime() >= now,
    }))
    .filter((entry) => entry.score > 0 || entry.isUpcoming)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.event.eventDate).getTime() - new Date(b.event.eventDate).getTime();
    })
    .slice(0, 3);

  return scored.map(({ event }) => ({
    id: event.id,
    title: event.title,
    location: event.location,
    eventDate: event.eventDate,
    eventType: event.eventType ?? "FREE",
    price: event.price ?? null,
    category: event.category ?? null,
    href: `/events/${event.id}`,
    reason: buildReason(event, message),
  }));
}
