import { NextResponse } from "next/server";
import {
  emptyAiAssistantResponse,
  resolveAiAssistantResponse,
} from "@/lib/ai/help-assistant-core";
import { AiAssistantMessage } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: AiAssistantMessage[];
    };
    const message = body.message?.trim() ?? "";
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!message) {
      return NextResponse.json(emptyAiAssistantResponse, { status: 200 });
    }

    const result = await resolveAiAssistantResponse(message, history);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        answer:
          "I could not process that request right now. Please try again with a shorter project-related question.",
        relatedLinks: [],
        recommendedEvents: [],
        suggestedPrompts: [],
        mode: "local",
        confidence: "low",
      },
      { status: 200 },
    );
  }
}
