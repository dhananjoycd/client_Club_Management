"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Bot, CalendarRange, LoaderCircle, MapPin, SendHorizonal, Sparkles, Ticket } from "lucide-react";
import { AiAssistantEventRecommendation, AiAssistantLink, AiAssistantMessage, AiAssistantResponse } from "@/lib/ai/types";

type ChatMessage = AiAssistantMessage & {
  id: string;
  relatedLinks?: AiAssistantLink[];
  recommendedEvents?: AiAssistantEventRecommendation[];
  suggestedPrompts?: string[];
  mode?: "gemini" | "local";
  confidence?: "high" | "medium" | "low";
  isStreaming?: boolean;
  providerStatus?: AiAssistantResponse["providerStatus"];
};

const starterPrompts = [
  "What events are next?",
  "How do I apply for membership?",
  "Who is on the committee?",
  "How can I contact support?",
];

type AssistantStreamEvent =
  | {
      type: "start";
      data: {
        mode: "gemini" | "local";
        confidence: "high" | "medium" | "low";
      };
    }
  | { type: "chunk"; data: string }
  | {
      type: "meta";
      data: Omit<AiAssistantResponse, "answer">;
    }
  | { type: "done" }
  | { type: "error"; data: { message: string } };

const confidenceLabel: Record<"high" | "medium" | "low", string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Clarify needed",
};

const confidenceClassName: Record<"high" | "medium" | "low", string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-rose-100 text-rose-700",
};

function buildFollowUpPrompts(question: string, response?: AiAssistantResponse): string[] {
  const source = `${question} ${response?.answer ?? ""}`.toLowerCase();

  if (source.includes("committee") || source.includes("leadership") || source.includes("president") || source.includes("secretary")) {
    return ["Who is on the committee?", "What do these roles mean?", "Open the committee page"];
  }

  if (source.includes("event") || source.includes("workshop") || source.includes("registration") || source.includes("free") || source.includes("paid")) {
    return ["What events are next?", "Show free events", "How do I register?"];
  }

  if (source.includes("membership") || source.includes("apply") || source.includes("join")) {
    return ["Am I eligible to apply?", "What do I need for the form?", "Open the apply page"];
  }

  if (source.includes("contact") || source.includes("support") || source.includes("message")) {
    return ["What happens after I send it?", "Open manual support", "How long does a reply take?"];
  }

  if (source.includes("notice") || source.includes("announcement")) {
    return ["Show latest notices", "Can I search notices?", "Open notices page"];
  }

  if (source.includes("manager") || source.includes("event manager")) {
    return ["What can event managers do?", "Where is the event dashboard?", "Who can access it?"];
  }

  return ["What events are next?", "Who is on the committee?", "How do I contact the admin team?"];
}

export function AiHelpAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarterUsed, setIsStarterUsed] = useState(false);
  const [showSmartLoader, setShowSmartLoader] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Analyzing your question...");
  const [showManualHandoff, setShowManualHandoff] = useState(false);
  const loaderTimersRef = useRef<number[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const messageCounterRef = useRef(1);
  const visibleMessages = useMemo(() => messages.slice(-6), [messages]);
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );

  const scrollToLatestMessage = (behavior: ScrollBehavior = "smooth") => {
    endOfMessagesRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    loaderTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    loaderTimersRef.current = [];

    if (!isLoading) {
      setShowSmartLoader(false);
      setShowManualHandoff(false);
      setLoadingStage("Analyzing your question...");
      return;
    }

    setLoadingStage("Analyzing your question...");
    loaderTimersRef.current.push(window.setTimeout(() => {
      setShowSmartLoader(true);
    }, 300));
    loaderTimersRef.current.push(window.setTimeout(() => {
      setLoadingStage("Matching club data and pages...");
    }, 1600));
    loaderTimersRef.current.push(window.setTimeout(() => {
      setLoadingStage("Preparing the final answer...");
    }, 3400));
    loaderTimersRef.current.push(window.setTimeout(() => {
      setShowManualHandoff(true);
    }, 5000));

    return () => {
      loaderTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      loaderTimersRef.current = [];
    };
  }, [isLoading]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    const behavior = messages.length <= 2 ? "auto" : "smooth";
    const timer = window.setTimeout(() => {
      scrollToLatestMessage(behavior);
    }, 40);

    return () => window.clearTimeout(timer);
  }, [messages, showSmartLoader, loadingStage, showManualHandoff]);

  const sendPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) {
      return;
    }

    const userMessageId = `user-${messageCounterRef.current++}`;
    const assistantMessageId = `assistant-${messageCounterRef.current++}`;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: userMessageId, role: "user", content: trimmedPrompt },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        mode: "local",
        confidence: "medium",
        isStreaming: true,
      },
    ];
    setMessages(nextMessages);
    setIsStarterUsed(true);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/help-assistant/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedPrompt,
          history: nextMessages
            .filter((item) => item.role === "user" || item.content)
            .map(({ role, content }) => ({ role, content }))
            .slice(-6),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Assistant request failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalMeta: Omit<AiAssistantResponse, "answer"> | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) {
            continue;
          }

          const event = JSON.parse(trimmedLine) as AssistantStreamEvent;
          if (event.type === "start") {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      mode: event.data.mode,
                      confidence: event.data.confidence,
                    }
                  : item,
              ),
            );
          }

          if (event.type === "chunk") {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      content: `${item.content}${event.data}`,
                    }
                  : item,
              ),
            );
          }

          if (event.type === "meta") {
            finalMeta = event.data;
          }

          if (event.type === "error") {
            throw new Error(event.data.message);
          }
        }
      }

      setMessages((current) =>
        current.map((item) => {
          if (item.id !== assistantMessageId) {
            return item;
          }

          const completeAnswer = item.content;
          const followUps = finalMeta
            ? buildFollowUpPrompts(trimmedPrompt, {
                answer: completeAnswer,
                relatedLinks: finalMeta.relatedLinks,
                recommendedEvents: finalMeta.recommendedEvents,
                suggestedPrompts: finalMeta.suggestedPrompts,
                mode: finalMeta.mode,
                confidence: finalMeta.confidence,
              })
            : buildFollowUpPrompts(trimmedPrompt);

          return {
            ...item,
            relatedLinks: finalMeta?.relatedLinks ?? [],
            recommendedEvents: finalMeta?.recommendedEvents ?? [],
            suggestedPrompts:
              followUps.length ? followUps : (finalMeta?.suggestedPrompts ?? []),
            mode: finalMeta?.mode ?? item.mode,
            confidence: finalMeta?.confidence ?? item.confidence,
            providerStatus: finalMeta?.providerStatus,
            isStreaming: false,
          };
        }),
      );
    } catch {
      setMessages((current) => [
        ...current.filter((item) => item.id !== assistantMessageId),
        {
          id: `assistant-error-${messageCounterRef.current++}`,
          role: "assistant",
          content: "I could not complete that request right now. Try asking again about events, membership, contact support, or notices.",
          suggestedPrompts: buildFollowUpPrompts(trimmedPrompt),
          recommendedEvents: [],
          mode: "local",
          confidence: "low",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary-strong)]">XYZ Tech Club</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">Feel free to ask about XYZ Tech Club AI assistant <b>Pranita</b>.</p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          const distanceFromBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;
          shouldAutoScrollRef.current = distanceFromBottom < 80;
        }}
        className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1"
      >
        {visibleMessages.map((message, index) => (
          <article
            key={message.id}
            className={`rounded-[1.25rem] px-4 py-3 ${message.role === "assistant" ? "app-card-subtle text-[var(--color-foreground)]" : "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"}`}
          >
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${message.role === "assistant" ? "text-[var(--color-muted-foreground)]" : "text-[var(--color-primary)]"}`}>
              {message.role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : null}
              <span>{message.role === "assistant" ? (message.mode === "gemini" ? "Pranita GV2.5" : "Pranita LV1.1") : "You"}</span>
              {message.role === "assistant" && message.confidence ? (
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold normal-case tracking-normal ${confidenceClassName[message.confidence]}`}>
                  {confidenceLabel[message.confidence]}
                </span>
              ) : null}
            </div>
            <p className={`mt-2 whitespace-pre-line text-sm leading-7 ${message.role === "assistant" ? "text-[var(--color-foreground)]" : "text-[var(--color-primary-strong)]"}`}>
              {message.content}
              {message.isStreaming ? <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-[var(--color-secondary)] align-[-2px]" /> : null}
            </p>
            {!message.isStreaming && message.recommendedEvents?.length ? (
              <div className="mt-4 grid gap-3">
                {message.recommendedEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-background)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{event.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--color-muted-foreground)]">{event.reason}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${event.eventType === "PAID" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {event.eventType === "PAID" ? `${event.price ?? 0} BDT` : "Free"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-muted-foreground)]">
                      <span className="inline-flex items-center gap-1.5"><CalendarRange className="h-3.5 w-3.5" />{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                      <span className="inline-flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5" />{event.category ?? "General event"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
            {!message.isStreaming && message.relatedLinks?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.relatedLinks.map((link) => (
                  <Link key={`${link.href}-${link.label}`} href={link.href} className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-xs font-semibold text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]">
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {!message.isStreaming && message.suggestedPrompts?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="w-full text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Good follow-ups</span>
                {message.suggestedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    disabled={isLoading}
                    className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-xs font-semibold text-[var(--color-muted-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {showSmartLoader ? (
          <article className="rounded-[1.25rem] app-card-subtle px-4 py-3 text-[var(--color-foreground)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assistant is working</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">{loadingStage}</p>
            {showManualHandoff ? (
              <div className="mt-3">
                <Link href="/contact#manual-support" className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-xs font-semibold text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]">
                  Need urgent help? Open manual contact
                </Link>
              </div>
            ) : null}
          </article>
        ) : null}
        <div ref={endOfMessagesRef} />
      </div>

      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void sendPrompt(input);
        }}
      >
        {!hasUserMessage && !isStarterUsed ? (
          <div className="flex flex-wrap gap-2">
            {starterPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendPrompt(prompt)}
                disabled={isLoading}
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-xs font-semibold text-[var(--color-muted-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={4}
          placeholder="Ask something like: Show me upcoming free workshops"
          className="input-base min-h-[120px] px-4 py-3 text-sm leading-6"
          disabled={isLoading}
        />
        {(() => {
          const latestAssistantMessage = [...messages]
            .reverse()
            .find((item) => item.role === "assistant" && !item.isStreaming);
          const providerStatus = latestAssistantMessage?.providerStatus;
          if (!providerStatus?.geminiAttempted || providerStatus.geminiSucceeded) {
            return null;
          }

          return (
            <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              <span className="font-semibold">AI note:</span> Pranita GV2.5 is unavailable right now, so I&apos;m using Pranita LV1.1 to answer your question. 
            </div>
          );
        })()}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[var(--color-muted-foreground)]"> I provide information about XYZ Tech Club through a combination of AI and human expertise. May not be 100% accurate. </p>
          <button type="submit" disabled={!input.trim() || isLoading} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
            <span className="inline-flex items-center gap-2">
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              {isLoading ? "Thinking..." : "Ask Assistant"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
