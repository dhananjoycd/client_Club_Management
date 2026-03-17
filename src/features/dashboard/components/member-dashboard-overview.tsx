"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, CalendarClock, FileCheck2, UserCircle2 } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { dashboardService } from "@/services/dashboard.service";

export function MemberDashboardOverview() {
  const dashboardQuery = useQuery({ queryKey: queryKeys.dashboard.member, queryFn: dashboardService.getMemberDashboard, retry: false });

  if (dashboardQuery.isLoading) return <LoadingState title="Loading account dashboard" description="Fetching your profile summary and events." />;
  if (dashboardQuery.isError) return <EmptyState title="Unable to load account dashboard" description={getApiErrorMessage(dashboardQuery.error, "Please verify your account session.")} />;

  const data = dashboardQuery.data?.data;
  if (!data) return <EmptyState title="No dashboard data" description="Account dashboard data is not available yet." />;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Membership status" value={data.profileStatus ?? "No membership yet"} description="Current membership record state from the backend." icon={<FileCheck2 className="h-5 w-5" />} />
        <StatCard label="Upcoming events" value={String(data.upcomingEvents.length)} description="Current event opportunities visible to your account." icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard label="My registrations" value={String(data.registeredEvents.length)} description="Active event registrations linked to your account." icon={<UserCircle2 className="h-5 w-5" />} />
      </section>
      {!data.profileComplete ? <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Complete your account profile before registering for a new event.</div> : null}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionWrapper title="Upcoming events" description="Pulled from your account dashboard endpoint.">
          {data.upcomingEvents.length ? data.upcomingEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group mb-3 block rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] last:mb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-primary)]">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">Open the event details page to see the full event summary.</p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{event.location}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          )) : <EmptyState title="No upcoming events" description="Upcoming events will appear here when available." />}
        </SectionWrapper>
        <SectionWrapper title="Registered events" description="Your active registrations from the backend.">
          {data.registeredEvents.length ? data.registeredEvents.map((registration) => (
            <Link
              key={registration.id}
              href={`/events/${registration.event.id}`}
              className="group mb-3 block rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] last:mb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">Open the event details page to review the full event information.</p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), "dd MMM yyyy")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={registration.status} variant={registration.status === "REGISTERED" ? "active" : "pending"} className="w-fit" />
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )) : <EmptyState title="No registrations yet" description="Registered events will appear here once you join any event." />}
        </SectionWrapper>
      </section>
    </div>
  );
}
