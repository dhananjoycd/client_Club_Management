"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { TableLoadingState } from "@/components/feedback/table-loading-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { applicationService } from "@/services/application.service";
import { ApplicationStatus, MembershipApplication } from "@/types/application.types";

const APPLICATIONS_PER_PAGE = 10;
type QueueFilter = "ALL" | ApplicationStatus;

export function AdminApplicationsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("ALL");
  const [page, setPage] = useState(1);
  const [detailsApplication, setDetailsApplication] = useState<MembershipApplication | null>(null);
  const [pendingRejectApplication, setPendingRejectApplication] = useState<MembershipApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.list("admin"),
    queryFn: () => applicationService.getApplications({ limit: 100 }),
    retry: false,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: "APPROVED" | "REJECTED"; reason?: string }) =>
      applicationService.reviewApplication(id, { status, reason }),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Application reviewed successfully.");
      setPendingRejectApplication(null);
      setDetailsApplication(null);
      setRejectReason("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Review failed.")),
  });

  const applications = useMemo(() => applicationsQuery.data?.data.result ?? [], [applicationsQuery.data]);
  const pendingCount = applications.filter((application) => application.status === "PENDING").length;
  const approvedCount = applications.filter((application) => application.status === "APPROVED").length;
  const rejectedCount = applications.filter((application) => application.status === "REJECTED").length;

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesFilter = activeFilter === "ALL" ? true : application.status === activeFilter;
      if (!matchesFilter) return false;

      if (!normalizedSearch) return true;

      return [
        application.applicant?.name ?? "",
        application.applicant?.email ?? "",
        application.department,
        application.session,
        application.studentId,
        application.phone,
        application.district ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [activeFilter, applications, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / APPLICATIONS_PER_PAGE));
  const paginatedApplications = filteredApplications.slice((page - 1) * APPLICATIONS_PER_PAGE, page * APPLICATIONS_PER_PAGE);

  if (applicationsQuery.isLoading) {
    return <TableLoadingState title="Loading membership applications" description="Preparing the latest XYZ Tech Club membership requests for review." />;
  }

  if (applicationsQuery.isError) {
    return <EmptyState title="Unable to load applications" description={getApiErrorMessage(applicationsQuery.error, "Please verify your admin session.")} />;
  }

  const handleApprove = (application: MembershipApplication) => {
    reviewMutation.mutate({ id: application.id, status: "APPROVED" });
  };

  const handleReject = () => {
    if (!pendingRejectApplication) return;
    reviewMutation.mutate({
      id: pendingRejectApplication.id,
      status: "REJECTED",
      reason: rejectReason.trim() || undefined,
    });
  };

  return (
    <>
      <SectionWrapper title="Application queue" description="Review new XYZ Tech Club membership requests, track pending decisions, and open full details only when needed.">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Pending now</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{pendingCount}</p>
              <p className="mt-2 text-sm text-amber-700">Applications waiting for a super admin decision.</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Approved</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">{approvedCount}</p>
              <p className="mt-2 text-sm text-emerald-700">Applicants already moved into the member flow.</p>
            </div>
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-800">Rejected</p>
              <p className="mt-2 text-3xl font-semibold text-rose-900">{rejectedCount}</p>
              <p className="mt-2 text-sm text-rose-700">Applicants who can update data and resubmit later.</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search applications</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by applicant, department, session, student ID, phone, or district"
                    className="input-base h-12 w-full min-w-0 pl-11 pr-4 text-sm"
                  />
                </div>
              </label>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                {([['ALL', 'All'], ['PENDING', 'Pending'], ['APPROVED', 'Approved'], ['REJECTED', 'Rejected']] as const).map(([value, label]) => (
                  <FilterChip key={value} label={label} active={activeFilter === value} onClick={() => setActiveFilter(value)} />
                ))}
              </div>
            </div>
          </div>

          {filteredApplications.length ? (
            <>
              <div className="grid gap-3">
                {paginatedApplications.map((application) => {
                  const isPending = application.status === "PENDING";
                  return (
                    <article
                      key={application.id}
                      className="grid gap-4 rounded-[1.5rem] border border-[var(--color-accent)] bg-[var(--color-primary-soft)] p-4 transition hover:shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-[var(--color-primary)]">{application.applicant?.name ?? application.applicant?.email ?? application.studentId}</h3>
                        <p className="mt-1 truncate text-sm text-[var(--color-muted-foreground)]">{application.applicant?.email}</p>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-muted-foreground)] sm:text-sm">
                          <span>{application.department}</span>
                          <span>{application.session}</span>
                          <span>{application.studentId}</span>
                          <span>{format(new Date(application.submittedAt), 'dd MMM yyyy')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <StatusBadge label={application.status} variant={application.status === 'APPROVED' ? 'active' : application.status === 'REJECTED' ? 'inactive' : 'pending'} />
                        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => setDetailsApplication(application)}
                            className="secondary-button h-10 px-4 text-sm"
                          >
                            Details
                          </button>
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={reviewMutation.isPending}
                                onClick={() => handleApprove(application)}
                                className="primary-button h-10 px-4 text-sm disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={reviewMutation.isPending}
                                onClick={() => {
                                  setPendingRejectApplication(application);
                                  setRejectReason('');
                                }}
                                className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="secondary-button h-10 px-4 text-sm opacity-70"
                            >
                              {application.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              title={searchTerm || activeFilter !== "ALL" ? "No matching applications" : "No applications found"}
              description={searchTerm || activeFilter !== "ALL" ? "Try another keyword or switch the current queue filter." : "Application records will appear here when users apply."}
            />
          )}
        </div>
      </SectionWrapper>

      {pendingRejectApplication ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-xl rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Reject application</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{pendingRejectApplication.applicant?.name ?? 'Applicant'}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">This applicant will be able to update their profile data and submit again after rejection.</p>
              </div>
              <StatusBadge label={pendingRejectApplication.status} variant="pending" />
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted-foreground)]">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <span>{pendingRejectApplication.department}</span>
                <span>{pendingRejectApplication.session}</span>
                <span>{pendingRejectApplication.studentId}</span>
              </div>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-[var(--color-primary-strong)]">Rejection note</span>
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={5}
                placeholder="Add a clear note so the applicant knows what should be corrected before resubmitting."
                className="input-base min-h-32 px-4 py-3 text-sm"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={reviewMutation.isPending}
                onClick={() => {
                  setPendingRejectApplication(null);
                  setRejectReason("");
                }}
                className="secondary-button h-11 px-5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewMutation.isPending}
                onClick={handleReject}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 disabled:opacity-50"
              >
                {reviewMutation.isPending ? 'Please wait...' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailsApplication ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-4xl rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Application details</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{detailsApplication.applicant?.name ?? 'Applicant details'}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{detailsApplication.applicant?.email}</p>
              </div>
              <StatusBadge label={detailsApplication.status} variant={detailsApplication.status === 'APPROVED' ? 'active' : detailsApplication.status === 'REJECTED' ? 'inactive' : 'pending'} />
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-[rgba(125,211,252,0.22)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-5 text-white">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[rgba(214,240,255,0.78)]">Submitted</p>
                  <p className="mt-2 text-sm font-semibold">{format(new Date(detailsApplication.submittedAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[rgba(214,240,255,0.78)]">Session</p>
                  <p className="mt-2 text-sm font-semibold">{detailsApplication.session}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[rgba(214,240,255,0.78)]">Student ID</p>
                  <p className="mt-2 text-sm font-semibold">{detailsApplication.studentId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[rgba(214,240,255,0.78)]">Phone</p>
                  <p className="mt-2 text-sm font-semibold">{detailsApplication.phone}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[["Department", detailsApplication.department], ["District", detailsApplication.district || 'Not provided'], ["Applicant role", detailsApplication.applicant?.role ?? 'USER']].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4">
                  <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {detailsApplication.status === 'PENDING' ? (
                <>
                  <button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() => {
                      setDetailsApplication(null);
                      setPendingRejectApplication(detailsApplication);
                      setRejectReason('');
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleApprove(detailsApplication)}
                    className="primary-button h-11 px-5 text-sm disabled:opacity-50"
                  >
                    Approve
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setDetailsApplication(null)}
                className="secondary-button h-11 px-5 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
