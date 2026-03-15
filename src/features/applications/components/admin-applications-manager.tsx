"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { applicationService } from "@/services/application.service";

export function AdminApplicationsManager() {
  const queryClient = useQueryClient();
  const applicationsQuery = useQuery({ queryKey: queryKeys.applications.list("admin"), queryFn: () => applicationService.getApplications({ limit: 20 }), retry: false });
  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => applicationService.reviewApplication(id, { status }),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Application reviewed successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Review failed.")),
  });

  if (applicationsQuery.isLoading) return <LoadingState title="Loading applications" description="Fetching the application queue from the backend." />;
  if (applicationsQuery.isError) return <EmptyState title="Unable to load applications" description={getApiErrorMessage(applicationsQuery.error, "Please verify your admin session.")} />;

  const applications = applicationsQuery.data?.data.result ?? [];
  const selected = applications[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionWrapper title="Application queue" description="Live application data from the backend review module.">
        {applications.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-[var(--color-muted-foreground)]">
                  <th className="px-4">Applicant</th><th className="px-4">Department</th><th className="px-4">Submitted</th><th className="px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="bg-[var(--color-page)] text-sm">
                    <td className="rounded-l-2xl px-4 py-4 font-medium text-[var(--color-primary)]">{app.applicant?.name ?? app.applicant?.email ?? app.studentId}</td>
                    <td className="px-4 py-4 text-[var(--color-muted-foreground)]">{app.department}</td>
                    <td className="px-4 py-4 text-[var(--color-muted-foreground)]">{format(new Date(app.submittedAt), "dd MMM yyyy")}</td>
                    <td className="rounded-r-2xl px-4 py-4"><StatusBadge label={app.status} variant={app.status === "APPROVED" ? "active" : app.status === "REJECTED" ? "inactive" : "pending"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No applications found" description="Application records will appear here when users apply." />}
      </SectionWrapper>
      <SectionWrapper title="Selected application" description="Approve or reject the first pending record as part of the admin workflow.">
        {selected ? (
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">{selected.applicant?.name ?? "Applicant"}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{selected.applicant?.email}</p>
              <div className="mt-4"><StatusBadge label={selected.status} variant={selected.status === "APPROVED" ? "active" : selected.status === "REJECTED" ? "inactive" : "pending"} /></div>
            </div>
            {[["Department", selected.department], ["Session", selected.session], ["Student ID", selected.studentId], ["District", selected.district], ["Phone", selected.phone]].map(([label, value]) => <div key={label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4"><p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p><p className="mt-2 text-sm text-[var(--color-primary)]">{value}</p></div>)}
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={reviewMutation.isPending || selected.status !== "PENDING"} onClick={() => reviewMutation.mutate({ id: selected.id, status: "APPROVED" })} className="h-11 rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-50">Approve</button>
              <button type="button" disabled={reviewMutation.isPending || selected.status !== "PENDING"} onClick={() => reviewMutation.mutate({ id: selected.id, status: "REJECTED" })} className="h-11 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-50">Reject</button>
            </div>
          </div>
        ) : <EmptyState title="No selected application" description="Select or wait for an application to review." />}
      </SectionWrapper>
    </div>
  );
}
