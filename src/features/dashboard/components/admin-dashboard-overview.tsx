"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BellRing, CalendarDays, FileStack, Users } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { dashboardService } from "@/services/dashboard.service";

export function AdminDashboardOverview() {
  const dashboardQuery = useQuery({ queryKey: queryKeys.dashboard.admin, queryFn: dashboardService.getAdminDashboard, retry: false });

  if (dashboardQuery.isLoading) return <LoadingState title="Loading admin overview" description="Preparing the latest XYZ Tech Club stats, notices, and activity summary." />;
  if (dashboardQuery.isError) return <EmptyState title="Unable to load admin dashboard" description={getApiErrorMessage(dashboardQuery.error, "Please verify your admin session.")} />;

  const data = dashboardQuery.data?.data;
  if (!data) return <EmptyState title="No dashboard data" description="Admin dashboard data is not available yet." />;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Members" value={String(data.totalMembers)} description="Total registered member profiles in the system." icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending applications" value={String(data.pendingApplications)} description="Applications awaiting admin review." icon={<FileStack className="h-5 w-5" />} />
        <StatCard label="Events" value={String(data.totalEvents)} description="Total event records available in the system." icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="Recent notices" value={String(data.recentNotices.length)} description="Recent notices from the backend dashboard summary." icon={<BellRing className="h-5 w-5" />} />
      </section>
      <SectionWrapper title="Recent notices" description="Latest notice activity from the admin dashboard endpoint.">
        {data.recentNotices.length ? (
          <div className="grid gap-4">
            {data.recentNotices.map((notice, index) => (
              <article key={notice.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-primary)]">{notice.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{format(new Date(notice.createdAt), "dd MMM yyyy")}</p>
                  </div>
                  <StatusBadge label={notice.audience} variant={index === 0 ? "active" : "info"} className="w-fit" />
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">{notice.content}</p>
              </article>
            ))}
          </div>
        ) : <EmptyState title="No recent notices" description="Recent notices will appear here when available." />}
      </SectionWrapper>
    </div>
  );
}

