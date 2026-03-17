"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BellRing, PencilLine } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
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

const isEditedNotice = (createdAt: string, updatedAt: string) => new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 1000;

export function ProtectedNoticesList() {
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  const noticesQuery = useQuery({
    queryKey: queryKeys.notices.all,
    queryFn: () => noticeService.getNotices({ limit: 10 }),
    enabled: Boolean(sessionQuery.data?.data?.user),
  });

  if (sessionQuery.isLoading) {
    return <LoadingState title="Checking access" description="Verifying your session before loading notices." />;
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
    return <LoadingState title="Loading notices" description="Fetching official notices from the backend." />;
  }

  if (noticesQuery.isError) {
    return <EmptyState title="Unable to load notices" description={getApiErrorMessage(noticesQuery.error, "Please try again later.")} />;
  }

  const notices = noticesQuery.data?.data.result ?? [];

  if (!notices.length) {
    return <EmptyState title="No notices available" description="Published notices will appear here when they become available for your access level." />;
  }

  return (
    <div className="grid gap-4">
      {notices.map((notice, index) => {
        const edited = isEditedNotice(notice.createdAt, notice.updatedAt);

        return (
          <article key={notice.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5 shadow-sm">
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
                  variant={index === 0 ? "active" : "info"}
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
  );
}
