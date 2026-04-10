import { aiQuickPrompts, knowledgeSections } from "@/lib/ai/knowledge-base";
import {
  AiAssistantDynamicContext,
  AiAssistantMessage,
  AiAssistantResponse,
  AiSearchItem,
  AiSearchResponse,
} from "@/lib/ai/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

type GeminiAttemptMeta = {
  attempted: boolean;
  succeeded: boolean;
  error: string | null;
  modelUsed?: string;
  modelsTried: string[];
};

type GeminiFallbackResult<T> = {
  result: T | null;
  meta: GeminiAttemptMeta;
};

export type GeminiAssistantReplyResult =
  GeminiFallbackResult<AiAssistantResponse>;

class GeminiRequestError extends Error {
  status: number;
  model: string;

  constructor(status: number, model: string) {
    super(`Gemini request failed with status ${status} for model ${model}`);
    this.name = "GeminiRequestError";
    this.status = status;
    this.model = model;
  }
}

function getApiKey() {
  return process.env.GEMINI_API_KEY?.trim();
}

function getGeminiModels() {
  const modelsFromList = (process.env.GEMINI_MODELS ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  const fallbackModel = process.env.GEMINI_MODEL?.trim();
  const merged = [...modelsFromList, ...(fallbackModel ? [fallbackModel] : [])];

  const uniqueModels = merged.filter(
    (model, index, list) => list.indexOf(model) === index,
  );

  return uniqueModels.length > 0 ? uniqueModels : [DEFAULT_GEMINI_MODEL];
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

  const model = getGeminiModels()[0];

  const response = await fetch(
    `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
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
    throw new GeminiRequestError(response.status, model);
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

async function requestGeminiJsonByModel(
  systemInstruction: string,
  prompt: string,
  model: string,
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
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
    throw new GeminiRequestError(response.status, model);
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

function shouldRetryWithNextModel(error: unknown) {
  if (error instanceof GeminiRequestError) {
    return [404, 429, 500, 502, 503, 504].includes(error.status);
  }

  if (error instanceof SyntaxError) {
    return true;
  }

  return false;
}

async function runWithGeminiModelFallback<T>(
  executor: (model: string) => Promise<T | null>,
): Promise<GeminiFallbackResult<T>> {
  const apiKey = getApiKey();
  const models = getGeminiModels();

  if (!apiKey || models.length === 0) {
    return {
      result: null,
      meta: {
        attempted: false,
        succeeded: false,
        error: null,
        modelsTried: [],
      },
    };
  }

  let lastError: string | null = null;
  const modelsTried: string[] = [];

  for (const model of models) {
    modelsTried.push(model);
    try {
      const result = await executor(model);
      if (result) {
        return {
          result,
          meta: {
            attempted: true,
            succeeded: true,
            error: null,
            modelUsed: model,
            modelsTried,
          },
        };
      }
      lastError = `Gemini model ${model} returned no usable answer.`;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Gemini request failed.";
      if (!shouldRetryWithNextModel(error)) {
        break;
      }
    }
  }

  return {
    result: null,
    meta: {
      attempted: true,
      succeeded: false,
      error: lastError,
      modelsTried,
    },
  };
}

export function isGeminiConfigured() {
  return Boolean(getApiKey()) && getGeminiModels().length > 0;
}

export async function generateGeminiSearchSuggestions(
  query: string,
  scope: string,
  items: AiSearchItem[],
  localSuggestions: AiSearchResponse["suggestions"],
): Promise<AiSearchResponse | null> {
  const fallbackResult = await runWithGeminiModelFallback(async (model) => {
    const result = (await requestGeminiJsonByModel(
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
      model,
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

    return { suggestions, mode: "gemini" as const };
  });

  return fallbackResult.result;
}

export async function generateGeminiAssistantReply(
  message: string,
  history: AiAssistantMessage[],
  dynamicContext?: AiAssistantDynamicContext,
): Promise<GeminiAssistantReplyResult> {
  const preferredSectionIds = dynamicContext?.intents?.length
    ? knowledgeSections
        .filter((section) =>
          dynamicContext.intents?.some(
            (intent) =>
              section.id === intent ||
              section.id.includes(intent) ||
              intent.includes(section.id),
          ),
        )
        .map((section) => section.id)
    : [];

  const knowledgeBase = knowledgeSections
    .filter(
      (section) =>
        !preferredSectionIds.length || preferredSectionIds.includes(section.id),
    )
    .map((section) => ({
      id: section.id,
      title: section.title,
      body: section.body,
      keywords: section.keywords,
      links: section.links,
    }));

  const fallbackKnowledgeBase = knowledgeSections.map((section) => ({
    id: section.id,
    title: section.title,
    body: section.body,
    keywords: section.keywords,
    links: section.links,
  }));

  const fallbackResult = await runWithGeminiModelFallback(async (model) => {
    const result = (await requestGeminiJsonByModel(
      "You are a friendly support assistant for a club management platform called XYZ Tech Club. Answer only from the provided knowledge and current public site data. Do not invent policies, names, dates, or features. If the current context is insufficient, say you could not confirm it from the available club data and guide the user to a relevant page. Prefer a natural, human support tone. When possible, include 1 to 3 useful internal links that start with /. Return only JSON.",
      JSON.stringify({
        task: "Answer project support question",
        message,
        history: history.slice(-6),
        intents: dynamicContext?.intents ?? [],
        knowledgeBase: knowledgeBase.length
          ? knowledgeBase
          : fallbackKnowledgeBase,
        publicSiteData: {
          about: dynamicContext?.about ?? null,
          committee: (dynamicContext?.committee ?? []).slice(0, 8),
          testimonials: (dynamicContext?.testimonials ?? []).slice(0, 4),
        },
        preferredPrompts: aiQuickPrompts.slice(0, 6),
        responseShape: {
          answer: "string",
          relatedLinks: [{ label: "string", href: "/path" }],
          suggestedPrompts: ["string"],
          confidence: "high | medium | low",
        },
      }),
      model,
    )) as {
      answer?: string;
      relatedLinks?: Array<{ label?: string; href?: string }>;
      suggestedPrompts?: string[];
      confidence?: "high" | "medium" | "low";
    } | null;

    if (!result?.answer?.trim()) {
      return null;
    }

    const answer = result.answer.trim();

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
      mode: "gemini" as const,
      confidence: result.confidence ?? "medium",
    };
  });

  return {
    result: fallbackResult.result,
    meta: fallbackResult.meta,
  };
}
