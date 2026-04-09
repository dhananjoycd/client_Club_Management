import { aiQuickPrompts, knowledgeSections } from "@/lib/ai/knowledge-base";
import {
  AiAssistantMessage,
  AiAssistantResponse,
  AiSearchItem,
  AiSearchResponse,
} from "@/lib/ai/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

function getApiKey() {
  return process.env.GEMINI_API_KEY?.trim();
}

function stripJsonFences(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

async function requestGeminiJson(systemInstruction: string, prompt: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 480,
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();
  if (!text) {
    return null;
  }

  return JSON.parse(stripJsonFences(text));
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

export async function generateGeminiSearchSuggestions(
  query: string,
  scope: string,
  items: AiSearchItem[],
  localSuggestions: AiSearchResponse["suggestions"],
): Promise<AiSearchResponse | null> {
  const result = (await requestGeminiJson(
    "You improve search suggestions for a club management web application. Return only JSON with a suggestions array. Each suggestion must be short, useful, and safe for a search box. Do not invent content that is unrelated to the provided items.",
    JSON.stringify({
      task: "Improve search suggestions",
      scope,
      query,
      candidateSuggestions: localSuggestions,
      items: items.slice(0, 8),
      responseShape: {
        suggestions: [{ text: "string", reason: "string" }],
      },
    }),
  )) as { suggestions?: Array<{ text?: string; reason?: string }> } | null;

  const suggestions = (result?.suggestions ?? [])
    .map((item) => ({
      text: item.text?.trim() ?? "",
      reason:
        item.reason?.trim() ??
        "AI-refined suggestion based on matching content.",
    }))
    .filter((item) => item.text)
    .slice(0, 5);

  if (!suggestions.length) {
    return null;
  }

  return { suggestions, mode: "gemini" };
}

export async function generateGeminiAssistantReply(
  message: string,
  history: AiAssistantMessage[],
): Promise<AiAssistantResponse | null> {
  const context = knowledgeSections.map((section) => ({
    title: section.title,
    body: section.body,
    keywords: section.keywords,
    links: section.links,
  }));

  const result = (await requestGeminiJson(
    "You are an assistant for a club management platform called XYZ Tech Club. Answer only from the provided application knowledge. If the user asks outside the scope, politely say the assistant only handles project-related help. Keep answers concise, practical, and friendly. Return only JSON.",
    JSON.stringify({
      task: "Answer project support question",
      message,
      history: history.slice(-6),
      knowledgeBase: context,
      preferredPrompts: aiQuickPrompts.slice(0, 4),
      responseShape: {
        answer: "string",
        relatedLinks: [{ label: "string", href: "/path" }],
        suggestedPrompts: ["string"],
      },
    }),
  )) as {
    answer?: string;
    relatedLinks?: Array<{ label?: string; href?: string }>;
    suggestedPrompts?: string[];
    confidence?: "high" | "medium" | "low";
  } | null;

  const answer = result?.answer?.trim();
  if (!answer) {
    return null;
  }

  return {
    answer,
    relatedLinks: (result.relatedLinks ?? [])
      .map((item) => ({
        label: item.label?.trim() ?? "Open page",
        href: item.href?.trim() ?? "",
      }))
      .filter((item) => item.href.startsWith("/"))
      .slice(0, 3),
    recommendedEvents: [],
    suggestedPrompts: (result.suggestedPrompts ?? [])
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3),
    mode: "gemini",
    confidence: result.confidence ?? "medium",
  };
}
