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

export type AiAboutSnapshot = {
  organizationName: string;
  contactEmail?: string;
  phone?: string;
  aboutText?: string;
  mission?: string;
  vision?: string;
  collaboration?: string;
  faqs: Array<{ question: string; answer: string }>;
};

export type AiCommitteeSnapshotItem = {
  name: string;
  role: string;
  department: string;
};

export type AiTestimonialSnapshotItem = {
  authorName: string;
  quote: string;
  meta: string;
  isFeatured?: boolean;
};

export type AiAssistantIntent =
  | "about"
  | "auth"
  | "committee"
  | "contact"
  | "events"
  | "membership"
  | "notices"
  | "profile"
  | "testimonials";

export type AiAssistantDynamicContext = {
  intents?: AiAssistantIntent[];
  about?: AiAboutSnapshot | null;
  committee?: AiCommitteeSnapshotItem[];
  testimonials?: AiTestimonialSnapshotItem[];
};

export type AiAssistantProviderStatus = {
  geminiConfigured: boolean;
  geminiAttempted: boolean;
  geminiSucceeded: boolean;
  geminiError?: string | null;
  geminiModelUsed?: string;
  geminiModelsTried?: string[];
};

export type AiAssistantResponse = {
  answer: string;
  relatedLinks: AiAssistantLink[];
  recommendedEvents: AiAssistantEventRecommendation[];
  suggestedPrompts: string[];
  mode: "gemini" | "local";
  confidence: AiAssistantConfidence;
  providerStatus?: AiAssistantProviderStatus;
};
