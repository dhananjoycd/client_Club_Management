"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Bot, CalendarRange, LoaderCircle, MapPin, SendHorizonal, Sparkles, Ticket } from "lucide-react";
import { AiAssistantEventRecommendation, AiAssistantLink, AiAssistantMessage, AiAssistantResponse } from "@/lib/ai/types";

type ChatMessage = AiAssistantMessage & {
  relatedLinks?: AiAssistantLink[];
  recommendedEvents?: AiAssistantEventRecommendation[];
  suggestedPrompts?: string[];
  mode?: "gemini" | "local";
  confidence?: "high" | "medium" | "low";
};

const initialMessage: ChatMessage = {
  role: "assistant",
  content: "I can help with XYZ Tech Club events, notices, membership, contact support, and event manager access. Ask a project-related question and I will point you to the most relevant page.",
  confidence: "medium",
};

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
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSmartLoader, setShowSmartLoader] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Analyzing your question...");
  const [showManualHandoff, setShowManualHandoff] = useState(false);
  const loaderTimersRef = useRef<number[]>([]);
  const visibleMessages = useMemo(() => messages.slice(-6), [messages]);

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

  const sendPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedPrompt }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/help-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedPrompt,
          history: nextMessages.map(({ role, content }) => ({ role, content })).slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error("Assistant request failed.");
      }

      const data = await response.json() as AiAssistantResponse;
      const followUps = buildFollowUpPrompts(trimmedPrompt, data);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
          relatedLinks: data.relatedLinks,
          recommendedEvents: data.recommendedEvents,
          suggestedPrompts: followUps.length ? followUps : data.suggestedPrompts,
          mode: data.mode,
          confidence: data.confidence,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
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
          <p className="text-sm font-semibold text-[var(--color-primary-strong)]">AI help assistant</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">Feel free to ask about XYZ Tech Club</p>
        </div>
      </div>

      <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
        {visibleMessages.map((message, index) => (
          <article
            key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
            className={`rounded-[1.25rem] px-4 py-3 ${message.role === "assistant" ? "app-card-subtle text-[var(--color-foreground)]" : "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"}`}
          >
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${message.role === "assistant" ? "text-[var(--color-muted-foreground)]" : "text-[var(--color-primary)]"}`}>
              {message.role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : null}
              <span>{message.role === "assistant" ? (message.mode === "gemini" ? "Gemini assistant" : "Project assistant") : "You"}</span>
              {message.role === "assistant" && message.confidence ? (
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold normal-case tracking-normal ${confidenceClassName[message.confidence]}`}>
                  {confidenceLabel[message.confidence]}
                </span>
              ) : null}
            </div>
            <p className={`mt-2 whitespace-pre-line text-sm leading-7 ${message.role === "assistant" ? "text-[var(--color-foreground)]" : "text-[var(--color-primary-strong)]"}`}>{message.content}</p>
            {message.recommendedEvents?.length ? (
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
            {message.relatedLinks?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.relatedLinks.map((link) => (
                  <Link key={`${link.href}-${link.label}`} href={link.href} className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-xs font-semibold text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]">
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {message.suggestedPrompts?.length ? (
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
      </div>

      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void sendPrompt(input);
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={4}
          placeholder="Ask something like: Show me upcoming free workshops"
          className="input-base min-h-[120px] px-4 py-3 text-sm leading-6"
          disabled={isLoading}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[var(--color-muted-foreground)]">Project-specific help only. Event-related questions can now return suggested events directly here.</p>
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
