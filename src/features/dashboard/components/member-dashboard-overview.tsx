"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, FileCheck2, UserCircle2 } from "lucide-react";
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

  if (dashboardQuery.isLoading) return <LoadingState title="Loading member dashboard" description="Fetching your member summary and events." />;
  if (dashboardQuery.isError) return <EmptyState title="Unable to load member dashboard" description={getApiErrorMessage(dashboardQuery.error, "Please verify your member session.")} />;

  const data = dashboardQuery.data?.data;
  if (!data) return <EmptyState title="No dashboard data" description="Member dashboard data is not available yet." />;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Profile status" value={data.profileStatus ?? "Unknown"} description="Current membership profile state from the backend." icon={<FileCheck2 className="h-5 w-5" />} />
        <StatCard label="Upcoming events" value={String(data.upcomingEvents.length)} description="Current event opportunities visible to members." icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard label="My registrations" value={String(data.registeredEvents.length)} description="Active event registrations linked to your profile." icon={<UserCircle2 className="h-5 w-5" />} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionWrapper title="Upcoming events" description="Pulled from the member dashboard endpoint.">
          {data.upcomingEvents.length ? data.upcomingEvents.map((event) => (
            <div key={event.id} className="mb-3 rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 last:mb-0">
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">{event.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{event.location}</p>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
            </div>
          )) : <EmptyState title="No upcoming events" description="Upcoming events will appear here when available." />}
        </SectionWrapper>
        <SectionWrapper title="Registered events" description="Your active registrations from the backend.">
          {data.registeredEvents.length ? data.registeredEvents.map((registration) => (
            <div key={registration.id} className="mb-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 last:mb-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), "dd MMM yyyy")}</p>
                </div>
                <StatusBadge label={registration.status} variant={registration.status === "REGISTERED" ? "active" : "pending"} className="w-fit" />
              </div>
            </div>
          )) : <EmptyState title="No registrations yet" description="Registered events will appear here once you join any event." />}
        </SectionWrapper>
      </section>
    </div>
  );
}
