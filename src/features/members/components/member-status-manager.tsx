"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { dashboardService } from "@/services/dashboard.service";

export function MemberStatusManager() {
  const dashboardQuery = useQuery({ queryKey: queryKeys.dashboard.member, queryFn: dashboardService.getMemberDashboard, retry: false });

  if (dashboardQuery.isLoading) return <LoadingState title="Loading membership status" description="Fetching your current member status." />;
  if (dashboardQuery.isError) return <EmptyState title="Unable to load status" description={getApiErrorMessage(dashboardQuery.error, "Please verify your member session.")} />;

  const data = dashboardQuery.data?.data;
  if (!data) return <EmptyState title="No status data" description="Membership status data is not available yet." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <SectionWrapper title="Membership progress" description="Current member standing sourced from the dashboard service.">
        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
          <p className="text-sm font-medium text-[var(--color-primary)]">Profile status</p>
          <div className="mt-4"><StatusBadge label={data.profileStatus ?? "UNKNOWN"} variant={data.profileStatus === "ACTIVE" ? "active" : "pending"} /></div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">This reflects the current member profile state returned by the backend member dashboard endpoint.</p>
        </div>
      </SectionWrapper>
      <SectionWrapper title="Registration summary" description="Your current active event activity in one place.">
        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Active registrations</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{data.registeredEvents.length}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">Upcoming event participation is counted from your current registration records.</p>
        </div>
      </SectionWrapper>
    </div>
  );
}
