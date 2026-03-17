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

  if (dashboardQuery.isLoading) return <LoadingState title="Loading your account" description="Preparing your XYZ Tech Club profile summary, events, and activity." />;
  if (dashboardQuery.isError) return <EmptyState title="Unable to load account dashboard" description={getApiErrorMessage(dashboardQuery.error, "Please verify your account session.")} />;

  const data = dashboardQuery.data?.data;
  if (!data) return <EmptyState title="No dashboard data" description="Account dashboard data is not available yet." />;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Club membership" value={data.profileStatus ?? "No membership yet"} description="Track whether your XYZ Tech Club membership is live and connected to this account." icon={<FileCheck2 className="h-5 w-5" />} />
        <StatCard label="Upcoming events" value={String(data.totalUpcomingEvents)} description="See how many live sessions, workshops, and campus activities you can explore next." icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard label="My registrations" value={String(data.registeredEvents.length)} description="Keep an eye on the events you already joined from this account." icon={<UserCircle2 className="h-5 w-5" />} />
      </section>
      {!data.profileComplete ? <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Complete your profile so XYZ Tech Club events can auto-fill your registration details instantly.</div> : null}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionWrapper title="Upcoming events" description="Preview the next sessions worth opening before seats fill up or registration closes.">
          {data.upcomingEvents.length ? data.upcomingEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group mb-3 block rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] last:mb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {event.category ? <StatusBadge label={event.category} variant="info" className="w-fit text-[10px]" /> : null}
                    <StatusBadge label={event.eventType === "PAID" ? "Paid event" : "Free entry"} variant={event.eventType === "PAID" ? "pending" : "active"} className="w-fit text-[10px]" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--color-primary)]">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
                    {event.eventType === "PAID"
                      ? `Seats are limited. Open details to review the full agenda and payment flow before booking your place.`
                      : `Open details to preview the full session plan, registration flow, and what you will get from this event.`}
                  </p>
                  <div className="mt-3 grid gap-1 text-sm text-[var(--color-muted-foreground)]">
                    <p>{event.location}</p>
                    <p>{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
                    <p>
                      {event.capacity} seats available{event.eventType === "PAID" && event.price ? ` ? ${event.price} BDT` : ""}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          )) : <EmptyState title="No upcoming events" description="Fresh XYZ Tech Club sessions will show up here as soon as new events go live." />}
        </SectionWrapper>
        <SectionWrapper title="Registered events" description="Review the events you already secured so you do not miss the next step.">
          {data.registeredEvents.length ? data.registeredEvents.map((registration) => (
            <Link
              key={registration.id}
              href={`/events/${registration.event.id}`}
              className="group mb-3 block rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] last:mb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">Open the event page to recheck the schedule, venue, and registration context before the day arrives.</p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), "dd MMM yyyy")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={registration.status} variant={registration.status === "REGISTERED" ? "active" : "pending"} className="w-fit" />
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )) : <EmptyState title="No registrations yet" description="Once you register for an XYZ Tech Club event, it will appear here for quick follow-up." />}
        </SectionWrapper>
      </section>
    </div>
  );
}
