import { NextResponse } from "next/server";
import { generateGeminiSearchSuggestions } from "@/lib/ai/gemini";
import { createLocalSearchSuggestions } from "@/lib/ai/local";
import { AiSearchItem } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: string; scope?: string; items?: AiSearchItem[] };
    const query = body.query?.trim() ?? "";
    const scope = body.scope?.trim() || "content";
    const items = Array.isArray(body.items) ? body.items.slice(0, 20) : [];

    const localResult = createLocalSearchSuggestions(query, items, scope);
    if (!query || !items.length) {
      return NextResponse.json(localResult);
    }

    try {
      const geminiResult = await generateGeminiSearchSuggestions(query, scope, items, localResult.suggestions);
      if (geminiResult?.suggestions.length) {
        return NextResponse.json(geminiResult);
      }
    } catch {
      // Fall back silently to keep search responsive.
    }

    return NextResponse.json(localResult);
  } catch {
    return NextResponse.json({ suggestions: [], mode: "local" }, { status: 200 });
  }
}
