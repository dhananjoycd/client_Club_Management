"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BellRing, PencilLine, Search } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AiSuggestionPanel } from "@/components/ai/ai-suggestion-panel";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiSearchItem } from "@/lib/ai/types";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { noticeService } from "@/services/notice.service";

const audienceLabels: Record<string, string> = {
  ALL: "All signed-in users",
  USERS: "Users",
  APPLICANTS: "Applicants",
  MEMBERS: "Members",
  EVENT_MANAGERS: "Event managers",
  ADMINS: "Admins",
};

const PUBLIC_NOTICE_LIMIT = 10;
const PUBLIC_NOTICE_FETCH_LIMIT = 100;
const isEditedNotice = (createdAt: string, updatedAt: string) => new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 1000;

export function ProtectedNoticesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  const noticesQuery = useQuery({
    queryKey: queryKeys.notices.list("public-all"),
    queryFn: () => noticeService.getNotices({ limit: PUBLIC_NOTICE_FETCH_LIMIT, page: 1 }),
    enabled: Boolean(sessionQuery.data?.data?.user),
  });

  const allNotices = useMemo(() => noticesQuery.data?.data.result ?? [], [noticesQuery.data]);
  const aiSearchItems = useMemo<AiSearchItem[]>(() => allNotices.map((notice) => ({
    title: notice.title,
    summary: notice.content,
    keywords: [audienceLabels[notice.audience] ?? notice.audience, "notice", "announcement"],
    href: "/notices",
  })), [allNotices]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  if (sessionQuery.isLoading) {
    return <LoadingState title="Checking notice access" description="Confirming your account before loading the latest XYZ Tech Club notices." />;
  }

  if (!sessionQuery.data?.data?.user) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">Sign in to view notices</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
          The backend protects notice access. Sign in to see official announcements relevant to your role.
        </p>
        <div className="mt-5">
          <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (noticesQuery.isLoading) {
    return <LoadingState title="Loading club notices" description="Gathering the latest announcements shared by XYZ Tech Club." />;
  }

  if (noticesQuery.isError) {
    return <EmptyState title="Unable to load notices" description={getApiErrorMessage(noticesQuery.error, "Please try again later.")} />;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isHighlightedNotice = (title: string, content: string) => normalizedSearch.length >= 3 && [title, content].some((value) => value.toLowerCase().includes(normalizedSearch));
  const filteredNotices = allNotices.filter((notice) => {
    if (!normalizedSearch) return true;
    return [notice.title, notice.content].some((value) => value.toLowerCase().includes(normalizedSearch));
  });
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / PUBLIC_NOTICE_LIMIT));
  const notices = filteredNotices.slice((page - 1) * PUBLIC_NOTICE_LIMIT, page * PUBLIC_NOTICE_LIMIT);
  const hasSearch = Boolean(normalizedSearch);

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
        <div className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search notices</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                name="notice-search"
                value={searchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Search by title or content"
                className="input-base h-12 w-full pl-11 pr-4 text-sm"
              />
            </div>
          </label>
          <AiSuggestionPanel
            query={searchTerm}
            scope="notices"
            items={aiSearchItems}
            active={isSearchFocused}
            onSelect={(value) => {
              setSearchTerm(value);
              setIsSearchFocused(false);
            }}
          />
        </div>
      </div>

      {!notices.length ? (
        <EmptyState
          title={hasSearch ? "No matching notices" : "No notices available"}
          description={
            hasSearch
              ? "Try a different title or keyword to find the notice you need."
              : "Published notices will appear here when they become available for your access level."
          }
        />
      ) : (
        <>
          <div className="grid gap-4">
            {notices.map((notice, index) => {
              const edited = isEditedNotice(notice.createdAt, notice.updatedAt);

              return (
                <article key={notice.id} className={`rounded-[1.5rem] border p-5 shadow-sm transition ${isHighlightedNotice(notice.title, notice.content) ? "app-card-soft border-[rgba(37,99,235,0.32)] shadow-[0_16px_32px_rgba(37,99,235,0.08)]" : "app-card"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex rounded-2xl bg-[var(--color-primary-soft)] p-2 text-[var(--color-primary)]">
                        <BellRing className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--color-primary)]">{notice.title}</h3>
                      <div className="space-y-1 text-sm text-[var(--color-muted-foreground)]">
                        <p>{format(new Date(notice.createdAt), "dd MMM yyyy, hh:mm a")}</p>
                        {edited ? <p>Last updated {format(new Date(notice.updatedAt), "dd MMM yyyy, hh:mm a")}</p> : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        label={audienceLabels[notice.audience] ?? notice.audience}
                        variant={index === 0 && page === 1 && !hasSearch ? "active" : "info"}
                        className="w-fit"
                      />
                      {edited ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                          <PencilLine className="h-3.5 w-3.5" />
                          Edited
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">{notice.content}</p>
                </article>
              );
            })}
          </div>

          <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
