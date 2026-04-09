import { NextResponse } from "next/server";
import { getAiCommitteeSnapshot } from "@/lib/ai/committee-source";
import { getAiEventCatalog } from "@/lib/ai/event-source";
import { generateGeminiAssistantReply } from "@/lib/ai/gemini";
import { createLocalAssistantReply } from "@/lib/ai/local";
import { createEventRecommendations } from "@/lib/ai/recommendations";
import { AiAssistantMessage, AiAssistantResponse } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

const emptyResponse: AiAssistantResponse = {
  answer:
    "Ask a question about events, membership, notices, contact support, or event manager access.",
  relatedLinks: [],
  recommendedEvents: [],
  suggestedPrompts: [],
  mode: "local",
  confidence: "low",
};

const committeeKeywords = [
  "committee",
  "president",
  "secretary",
  "convener",
  "leadership",
  "club team",
  "executive",
];

function isCommitteeQuestion(message: string) {
  const normalized = message.toLowerCase();
  return committeeKeywords.some((keyword) => normalized.includes(keyword));
}

function createCommitteeResponse(
  committeeSnapshot: Array<{ name: string; role: string; department: string }>,
): AiAssistantResponse {
  if (!committeeSnapshot.length) {
    return {
      answer:
        "I could not load the live committee list right now. Please open the committee page for the current leadership details.",
      relatedLinks: [{ label: "Open committee page", href: "/committee" }],
      recommendedEvents: [],
      suggestedPrompts: [
        "Open the committee page",
        "Who leads the club right now?",
        "Show committee roles",
      ],
      mode: "local",
      confidence: "low",
    };
  }

  const summary = committeeSnapshot
    .slice(0, 5)
    .map(
      (member) =>
        `${member.name} - ${member.role}${member.department ? ` (${member.department})` : ""}`,
    )
    .join("\n");

  const leadMember =
    committeeSnapshot.find((member) =>
      /president|chair|convener|secretary|coordinator/i.test(member.role),
    ) ?? committeeSnapshot[0];

  return {
    answer: `Here is the current committee snapshot:\n${summary}\n\n${leadMember ? `If you want the main contact point, start with ${leadMember.name} (${leadMember.role}).` : "Open the committee page for more details."}`,
    relatedLinks: [{ label: "Open committee page", href: "/committee" }],
    recommendedEvents: [],
    suggestedPrompts: [
      "Who is the president?",
      "Show more committee members",
      "Open the committee page",
    ],
    mode: "local",
    confidence: "high",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: AiAssistantMessage[];
    };
    const message = body.message?.trim() ?? "";
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!message) {
      return NextResponse.json(emptyResponse, { status: 200 });
    }

    if (isCommitteeQuestion(message)) {
      try {
        const committeeSnapshot = await getAiCommitteeSnapshot();
        return NextResponse.json(createCommitteeResponse(committeeSnapshot));
      } catch {
        return NextResponse.json(createCommitteeResponse([]));
      }
    }

    const localResult = createLocalAssistantReply(message, history);
    let baseResult: AiAssistantResponse = localResult;

    try {
      const geminiResult = await generateGeminiAssistantReply(message, history);
      if (geminiResult?.answer) {
        baseResult = geminiResult;
      }
    } catch {
      // Keep fallback response available even if Gemini is unavailable.
    }

    try {
      const events = await getAiEventCatalog();
      const recommendedEvents = createEventRecommendations(message, events);
      return NextResponse.json({
        ...baseResult,
        recommendedEvents,
      });
    } catch {
      return NextResponse.json(baseResult);
    }
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
