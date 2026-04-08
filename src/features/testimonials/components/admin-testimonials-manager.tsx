"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Star } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { TableLoadingState } from "@/components/feedback/table-loading-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { testimonialService } from "@/services/testimonial.service";
import { AdminTestimonial, TestimonialStatus } from "@/types/testimonial.types";

type PendingQuickAction = {
  item: AdminTestimonial;
  status: "APPROVED" | "REJECTED";
  confirmLabel: string;
  title: string;
  description: string;
  featured?: boolean;
};

const TESTIMONIALS_PER_PAGE = 8;
const statusOptions: Array<{ value: TestimonialStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];
const badgeVariant = (status: TestimonialStatus) => status === "APPROVED" ? "active" as const : status === "REJECTED" ? "inactive" as const : "pending" as const;
const adminNoteSuggestions = [
  "Thank you for sharing your experience with XYZ Tech Club.",
  "This testimonial is clear and reflects a real club experience.",
  "Please revise the wording slightly and resubmit for approval.",
  "Add a bit more specific detail about the event or learning outcome.",
];

export function AdminTestimonialsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestimonialStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminTestimonial | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("1");
  const [pendingQuickAction, setPendingQuickAction] = useState<PendingQuickAction | null>(null);
  const [pendingQuickNote, setPendingQuickNote] = useState("");

  const testimonialsQuery = useQuery({
    queryKey: queryKeys.testimonials.adminList(`page-${page}-status-${statusFilter}-search-${searchTerm}`),
    queryFn: () => testimonialService.getAdminTestimonials({
      page,
      limit: TESTIMONIALS_PER_PAGE,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      searchTerm: searchTerm || undefined,
    }),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reviewNote, featured, order }: { id: string; status: "APPROVED" | "REJECTED"; reviewNote?: string; featured?: boolean; order?: number }) =>
      testimonialService.reviewTestimonial(id, {
        status,
        reviewReason: reviewNote || undefined,
        isFeatured: status === "APPROVED" ? featured : undefined,
        displayOrder: status === "APPROVED" ? Math.max(1, order || 1) : undefined,
      }),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Testimonial reviewed successfully.");
      setSelected(null);
      setReviewReason("");
      setIsFeatured(false);
      setDisplayOrder("1");
      setPendingQuickAction(null);
      setPendingQuickNote("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Testimonial review failed.")),
  });

  const data = testimonialsQuery.data?.data;
  const totalPages = data?.meta ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  const openDetails = (item: AdminTestimonial) => {
    setSelected(item);
    setReviewReason(item.reviewReason || "");
    setIsFeatured(item.isFeatured);
    setDisplayOrder(String(Math.max(1, item.displayOrder ?? 1)));
  };

  const openQuickAction = (item: AdminTestimonial, status: "APPROVED" | "REJECTED", featured = item.isFeatured) => {
    setPendingQuickAction({
      item,
      status,
      featured,
      confirmLabel: status === "APPROVED" ? (item.status === "APPROVED" ? "Save change" : "Approve now") : "Confirm rejection",
      title: status === "APPROVED" ? (item.status === "APPROVED" ? "Update testimonial visibility" : "Approve this testimonial?") : "Reject this testimonial?",
      description: status === "APPROVED"
        ? "This action will publish or update the testimonial state for public display."
        : "The testimonial will be moved to rejected status and the user can review your note before resubmitting.",
    });
    setPendingQuickNote(item.reviewReason || "");
  };

  const confirmQuickAction = () => {
    if (!pendingQuickAction) return;
    reviewMutation.mutate({
      id: pendingQuickAction.item.id,
      status: pendingQuickAction.status,
      reviewNote: pendingQuickNote || undefined,
      featured: pendingQuickAction.featured,
      order: Math.max(1, pendingQuickAction.item.displayOrder ?? 1),
    });
  };

  if (!testimonialsQuery.data && testimonialsQuery.isLoading) {
    return <TableLoadingState title="Loading testimonials" description="Preparing community submissions and moderation status." />;
  }

  if (testimonialsQuery.isError) {
    return <EmptyState title="Unable to load testimonials" description={getApiErrorMessage(testimonialsQuery.error, "Please verify your admin session.")} />;
  }

  return (
    <>
      <SectionWrapper title="Testimonials" description="Review community submissions before they appear on the public testimonials page.">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4"><p className="text-sm text-[var(--color-muted-foreground)]">Total</p><p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{data?.summary.total ?? 0}</p></div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-amber-800">Pending</p><p className="mt-2 text-3xl font-semibold text-amber-900">{data?.summary.pending ?? 0}</p></div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm text-emerald-800">Approved</p><p className="mt-2 text-3xl font-semibold text-emerald-900">{data?.summary.approved ?? 0}</p></div>
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4"><p className="text-sm text-rose-800">Rejected</p><p className="mt-2 text-3xl font-semibold text-rose-900">{data?.summary.rejected ?? 0}</p></div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search testimonials</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} placeholder="Search by author, email, quote, or meta" className="input-base h-12 w-full pl-11 pr-4 text-sm" />
              </div>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((option) => <FilterChip key={option.value} label={option.label} active={statusFilter === option.value} onClick={() => { setStatusFilter(option.value); setPage(1); }} />)}
            </div>
          </div>

          {data?.result.length ? (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {data.result.map((item) => (
                  <article key={item.id} className="rounded-[1.5rem] app-card-subtle p-5 transition hover:border-[var(--color-accent)] hover:bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-[var(--color-primary)]">{item.authorName}</p>
                          {item.isFeatured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><Star className="h-3.5 w-3.5 fill-current" /> Featured</span> : null}
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{item.user.email}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                      </div>
                      <StatusBadge label={item.status} variant={badgeVariant(item.status)} />
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
                      <p className="line-clamp-3 text-sm leading-7 text-[var(--color-foreground)]">&ldquo;{item.quote}&rdquo;</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[var(--color-muted-foreground)]">Submitted {new Date(item.createdAt).toLocaleDateString("en-GB")}</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openDetails(item)} className="secondary-button h-10 px-4 text-sm">Details</button>
                        {item.status === "PENDING" ? (
                          <>
                            <button type="button" onClick={() => openQuickAction(item, "APPROVED")} disabled={reviewMutation.isPending} className="primary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Approve</button>
                            <button type="button" onClick={() => openQuickAction(item, "REJECTED")} disabled={reviewMutation.isPending} className="h-10 rounded-full border border-rose-200 px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">Reject</button>
                          </>
                        ) : item.status === "APPROVED" ? (
                          <button type="button" onClick={() => openQuickAction(item, "APPROVED", !item.isFeatured)} disabled={reviewMutation.isPending} className="h-10 rounded-full border border-amber-200 px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60">{item.isFeatured ? "Remove featured" : "Mark featured"}</button>
                        ) : (
                          <button type="button" onClick={() => openQuickAction(item, "APPROVED")} disabled={reviewMutation.isPending} className="primary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Approve now</button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No testimonials found" description="No testimonial matches the current filters yet." />
          )}
        </div>
      </SectionWrapper>

      {selected ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/45 px-4 py-6" role="dialog" aria-modal="true">
          <div className="mx-auto my-auto max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 shadow-[0_28px_70px_rgba(8,22,49,0.24)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Testimonial details</p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--color-primary-strong)]">{selected.authorName}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{selected.user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={selected.status} variant={badgeVariant(selected.status)} />
                <button type="button" onClick={() => setSelected(null)} className="secondary-button h-10 px-4 text-sm">Close</button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Context</p>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-strong)]">{selected.meta}</p>
              </div>
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Display order</p>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-strong)]">{displayOrder}</p>
              </div>
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Submitted</p>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-strong)]">{new Date(selected.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] app-card-subtle p-5">
              <p className="text-sm leading-8 text-[var(--color-foreground)]">&ldquo;{selected.quote}&rdquo;</p>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Admin note</span>
                <textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Optional note for approval or rejection..." />
              </label>
              <div className="flex flex-wrap gap-2">
                {adminNoteSuggestions.map((note) => (
                  <button key={note} type="button" onClick={() => setReviewReason(note)} className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-primary)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-page)]">
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[0.6fr_1fr]">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Display order</span>
                <input value={displayOrder} onChange={(event) => setDisplayOrder(String(Math.max(1, Number.parseInt(event.target.value || "1", 10) || 1)))} className="input-base h-12 px-4 text-sm" inputMode="numeric" min="1" />
              </label>
              <label className="flex items-center gap-3 rounded-[1rem] app-card-subtle px-4 py-3 text-sm text-[var(--color-primary-strong)]">
                <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} className="h-4 w-4" />
                Mark this testimonial as featured
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {selected.status !== "APPROVED" ? <button type="button" onClick={() => reviewMutation.mutate({ id: selected.id, status: "APPROVED", reviewNote: reviewReason || undefined, featured: isFeatured, order: Math.max(1, Number.parseInt(displayOrder || "1", 10) || 1) })} disabled={reviewMutation.isPending} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">Approve</button> : <button type="button" onClick={() => reviewMutation.mutate({ id: selected.id, status: "APPROVED", reviewNote: reviewReason || undefined, featured: isFeatured, order: Math.max(1, Number.parseInt(displayOrder || "1", 10) || 1) })} disabled={reviewMutation.isPending} className="secondary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">Save changes</button>}
              <button type="button" onClick={() => reviewMutation.mutate({ id: selected.id, status: "REJECTED", reviewNote: reviewReason || undefined, order: 1 })} disabled={reviewMutation.isPending} className="h-11 rounded-full border border-rose-200 px-5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">Reject</button>
            </div>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={Boolean(pendingQuickAction)}
        title={pendingQuickAction?.title ?? "Confirm action"}
        description={pendingQuickAction?.description ?? "Review this action before continuing."}
        confirmLabel={pendingQuickAction?.confirmLabel ?? "Confirm"}
        cancelLabel="Cancel"
        isLoading={reviewMutation.isPending}
        onConfirm={confirmQuickAction}
        onCancel={() => {
          setPendingQuickAction(null);
          setPendingQuickNote("");
        }}
      >
        <label className="grid gap-2 text-left">
          <span className="text-sm font-medium text-[var(--color-primary-strong)]">Admin note (optional)</span>
          <textarea value={pendingQuickNote} onChange={(event) => setPendingQuickNote(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Add a short note before confirming this action..." />
        </label>
      </WarningConfirmModal>
    </>
  );
}

