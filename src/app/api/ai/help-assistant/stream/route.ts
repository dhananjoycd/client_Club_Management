import {
  emptyAiAssistantResponse,
  resolveAiAssistantResponse,
} from "@/lib/ai/help-assistant-core";
import {
  AiAssistantConfidence,
  AiAssistantMessage,
  AiAssistantResponse,
} from "@/lib/ai/types";

export const dynamic = "force-dynamic";

type StreamEvent =
  | {
      type: "start";
      data: {
        mode: "gemini" | "local";
        confidence: AiAssistantConfidence;
      };
    }
  | { type: "chunk"; data: string }
  | {
      type: "meta";
      data: Omit<AiAssistantResponse, "answer">;
    }
  | { type: "done" }
  | { type: "error"; data: { message: string } };

function encodeEvent(event: StreamEvent) {
  return `${JSON.stringify(event)}\n`;
}

function chunkAnswer(answer: string) {
  const normalized = answer.replace(/\r\n/g, "\n");
  const chunks: string[] = [];
  let current = "";

  for (const char of normalized) {
    current += char;
    if (char === "\n" || current.length >= 24 || /[.!?]\s$/.test(current)) {
      chunks.push(current);
      current = "";
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.filter(Boolean);
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
      return new Response(
        encodeEvent({
          type: "error",
          data: { message: emptyAiAssistantResponse.answer },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        },
      );
    }

    const result = await resolveAiAssistantResponse(message, history);
    const encoder = new TextEncoder();
    const chunks = chunkAnswer(result.answer);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            encodeEvent({
              type: "start",
              data: {
                mode: result.mode,
                confidence: result.confidence,
              },
            }),
          ),
        );

        let index = 0;
        const pushChunk = () => {
          if (index < chunks.length) {
            const currentChunk = chunks[index];
            controller.enqueue(
              encoder.encode(
                encodeEvent({ type: "chunk", data: currentChunk }),
              ),
            );
            index += 1;
            setTimeout(pushChunk, /[\n.!?]\s*$/.test(currentChunk) ? 90 : 30);
            return;
          }

          controller.enqueue(
            encoder.encode(
              encodeEvent({
                type: "meta",
                data: {
                  relatedLinks: result.relatedLinks,
                  recommendedEvents: result.recommendedEvents,
                  suggestedPrompts: result.suggestedPrompts,
                  mode: result.mode,
                  confidence: result.confidence,
                  providerStatus: result.providerStatus,
                },
              }),
            ),
          );
          controller.enqueue(encoder.encode(encodeEvent({ type: "done" })));
          controller.close();
        };

        pushChunk();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch {
    return new Response(
      encodeEvent({
        type: "error",
        data: {
          message:
            "I could not process that request right now. Please try again with a shorter project-related question.",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      },
    );
  }
}
