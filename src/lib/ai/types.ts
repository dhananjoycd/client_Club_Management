export type AiSearchItem = {
  title: string;
  summary?: string;
  keywords?: string[];
  href?: string;
};

export type AiSearchSuggestion = {
  text: string;
  reason: string;
};

export type AiSearchResponse = {
  suggestions: AiSearchSuggestion[];
  mode: "gemini" | "local";
};

export type AiAssistantLink = {
  label: string;
  href: string;
};

export type AiAssistantEventRecommendation = {
  id: string;
  title: string;
  location: string;
  eventDate: string;
  eventType: "FREE" | "PAID";
  price?: number | null;
  category?: string | null;
  href: string;
  reason: string;
};

export type AiAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiAssistantConfidence = "high" | "medium" | "low";

export type AiAssistantResponse = {
  answer: string;
  relatedLinks: AiAssistantLink[];
  recommendedEvents: AiAssistantEventRecommendation[];
  suggestedPrompts: string[];
  mode: "gemini" | "local";
  confidence: AiAssistantConfidence;
};
