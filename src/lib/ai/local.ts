import { aiQuickPrompts, knowledgeSections } from "@/lib/ai/knowledge-base";
import {
  AiAssistantMessage,
  AiAssistantResponse,
  AiSearchItem,
  AiSearchResponse,
  AiSearchSuggestion,
} from "@/lib/ai/types";

const LOCAL_TOP_SCORE_MIN = 5;
const LOCAL_SECONDARY_RATIO = 0.62;

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function uniqueSuggestions(items: AiSearchSuggestion[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.text.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function createLocalSearchSuggestions(
  query: string,
  items: AiSearchItem[],
  scope: string,
): AiSearchResponse {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { suggestions: [], mode: "local" };
  }

  const queryTokens = tokenize(trimmedQuery);
  const scoredItems = items
    .map((item) => {
      const haystack = [
        item.title,
        item.summary ?? "",
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const score = queryTokens.reduce((total, token) => {
        if (item.title.toLowerCase().includes(token)) return total + 4;
        if (haystack.includes(token)) return total + 2;
        return total;
      }, 0);

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const suggestions = uniqueSuggestions([
    ...scoredItems.map(({ item }) => ({
      text: item.title,
      reason: `Relevant ${scope} match based on title and topic keywords.`,
    })),
    ...scoredItems.flatMap(({ item }) =>
      (item.keywords ?? [])
        .filter(
          (keyword) =>
            keyword.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
            queryTokens.some((token) => keyword.toLowerCase().includes(token)),
        )
        .slice(0, 2)
        .map((keyword) => ({
          text: keyword,
          reason: `Suggested keyword from related ${scope} content.`,
        })),
    ),
  ]).slice(0, 5);

  return { suggestions, mode: "local" };
}

export function createLocalAssistantReply(
  message: string,
  history: AiAssistantMessage[] = [],
): AiAssistantResponse {
  const tokens = tokenize(
    `${history.map((item) => item.content).join(" ")} ${message}`,
  );
  const rankedSections = knowledgeSections
    .map((section) => {
      const score = tokens.reduce((total, token) => {
        if (section.title.toLowerCase().includes(token)) return total + 4;
        if (
          section.keywords.some((keyword) =>
            keyword.toLowerCase().includes(token),
          )
        )
          return total + 3;
        if (section.body.toLowerCase().includes(token)) return total + 2;
        return total;
      }, 0);
      return { section, score };
    })
    .sort((a, b) => b.score - a.score);

  const bestMatch = rankedSections[0];
  if (!bestMatch || bestMatch.score < LOCAL_TOP_SCORE_MIN) {
    return {
      answer:
        "I can help best with club topics like events, committee, membership, notices, payments, and contact support. If you share a bit more detail, I can guide you more precisely.",
      relatedLinks: [
        { label: "Committee", href: "/committee" },
        { label: "Events", href: "/events" },
        { label: "Contact", href: "/contact" },
      ],
      recommendedEvents: [],
      suggestedPrompts: aiQuickPrompts.slice(0, 3),
      mode: "local",
      confidence: "low",
    };
  }

  const secondMatch = rankedSections[1];
  const includeSecond = Boolean(
    secondMatch &&
    secondMatch.score > 0 &&
    secondMatch.score >= Math.floor(bestMatch.score * LOCAL_SECONDARY_RATIO),
  );
  const sectionsToUse = includeSecond ? [bestMatch, secondMatch] : [bestMatch];

  const answer = sectionsToUse
    .map(({ section }, index) =>
      index === 0
        ? `Based on your question, this should help: ${section.body}`
        : `Also relevant: ${section.body}`,
    )
    .join("\n\n");

  const relatedLinks = sectionsToUse
    .flatMap(({ section }) => section.links)
    .filter(
      (link, index, list) =>
        list.findIndex((item) => item.href === link.href) === index,
    )
    .slice(0, 3);
  const suggestedPrompts = aiQuickPrompts
    .filter((prompt) => prompt.toLowerCase() !== message.trim().toLowerCase())
    .slice(0, 3);

  return {
    answer,
    relatedLinks,
    recommendedEvents: [],
    suggestedPrompts,
    mode: "local",
    confidence: bestMatch.score >= 10 ? "high" : "medium",
  };
}
