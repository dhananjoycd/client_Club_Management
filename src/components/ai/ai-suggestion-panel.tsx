"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiSearchItem, AiSearchResponse } from "@/lib/ai/types";

type AiSuggestionPanelProps = {
  query: string;
  scope: string;
  items: AiSearchItem[];
  active: boolean;
  onSelect: (value: string) => void;
};

export function AiSuggestionPanel({ query, scope, items, active, onSelect }: AiSuggestionPanelProps) {
  const [result, setResult] = useState<AiSearchResponse>({ suggestions: [], mode: "local" });
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Record<string, AiSearchResponse>>({});

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!active || trimmedQuery.length < 3 || !items.length) {
      setResult({ suggestions: [], mode: "local" });
      setIsLoading(false);
      return;
    }

    const cacheKey = `${scope}:${trimmedQuery.toLowerCase()}`;
    if (cacheRef.current[cacheKey]) {
      setResult(cacheRef.current[cacheKey]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/ai/search-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: trimmedQuery, scope, items: items.slice(0, 12) }),
        });
        if (!response.ok) {
          throw new Error("Suggestion request failed.");
        }
        const data = await response.json() as AiSearchResponse;
        if (!cancelled) {
          cacheRef.current[cacheKey] = data;
          setResult(data);
        }
      } catch {
        if (!cancelled) {
          setResult({ suggestions: [], mode: "local" });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, items, query, scope]);

  if (!active || query.trim().length < 3) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="rounded-[1.25rem] app-card-soft px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
        Preparing AI-assisted suggestions...
      </div>
    );
  }

  if (!result.suggestions.length) {
    return null;
  }

  return (
    <div className="rounded-[1.25rem] app-card-soft p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
        <Sparkles className="h-3.5 w-3.5" />
        <span>{result.mode === "gemini" ? "AI suggestions" : "Smart suggestions"}</span>
      </div>
      <div className="grid gap-2">
        {result.suggestions.map((suggestion) => (
          <button
            key={`${scope}-${suggestion.text}`}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setResult({ suggestions: [], mode: result.mode });
              onSelect(suggestion.text);
            }}
            className="rounded-[1rem] app-card-subtle px-4 py-3 text-left transition hover:border-[var(--color-accent)]"
          >
            <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{suggestion.text}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-muted-foreground)]">{suggestion.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
