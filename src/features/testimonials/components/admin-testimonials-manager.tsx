"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { testimonialService } from "@/services/testimonial.service";
import { AdminTestimonial, TestimonialStatus } from "@/types/testimonial.types";

const TESTIMONIALS_PER_PAGE = 8;
const statusOptions: Array<{ value: TestimonialStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];
const badgeVariant = (status: TestimonialStatus) => status === "APPROVED" ? "active" as const : status === "REJECTED" ? "inactive" as const : "pending" as const;

export function AdminTestimonialsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestimonialStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminTestimonial | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("0");

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
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => testimonialService.reviewTestimonial(id, {
      status,
      reviewReason: reviewReason || undefined,
      isFeatured: status === "APPROVED" ? isFeatured : undefined,
      displayOrder: status === "APPROVED" ? Number.parseInt(displayOrder || "0", 10) || 0 : undefined,
    }),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Testimonial reviewed successfully.");
      setSelected(null);
      setReviewReason("");
      setIsFeatured(false);
      setDisplayOrder("0");
      await queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Testimonial review failed.")),
  });

  const data = testimonialsQuery.data?.data;
  const totalPages = data?.meta ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  const openReview = (item: AdminTestimonial) => {
    setSelected(item);
    setReviewReason(item.reviewReason || "");
    setIsFeatured(item.isFeatured);
    setDisplayOrder(String(item.displayOrder ?? 0));
  };

  if (!testimonialsQuery.data && testimonialsQuery.isLoading) {
    return <LoadingState title="Loading testimonials" description="Preparing community submissions and moderation status." />;
  }

  if (testimonialsQuery.isError) {
    return <EmptyState title="Unable to load testimonials" description={getApiErrorMessage(testimonialsQuery.error, "Please verify your admin session.")} />;
  }

  return (
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
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4">
              {data.result.map((item) => (
                <button key={item.id} type="button" onClick={() => openReview(item)} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-5 text-left transition hover:border-[var(--color-accent)] hover:bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-primary)]">{item.authorName}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{item.user.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                    </div>
                    <StatusBadge label={item.status} variant={badgeVariant(item.status)} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-foreground)]">&ldquo;{item.quote}&rdquo;</p>
                </button>
              ))}
              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
              {selected ? (
                <div className="grid gap-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-2xl font-semibold text-[var(--color-primary-strong)]">Review testimonial</h2>
                      <StatusBadge label={selected.status} variant={badgeVariant(selected.status)} />
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{selected.user.email}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 p-4">
                    <p className="text-sm leading-7 text-[var(--color-foreground)]">&ldquo;{selected.quote}&rdquo;</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{selected.meta}</p>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--color-primary-strong)]">Admin note</span>
                    <textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Optional note for approval or rejection..." />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--color-primary-strong)]">Display order</span>
                    <input value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="input-base h-12 px-4 text-sm" inputMode="numeric" />
                  </label>
                  <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm text-[var(--color-primary-strong)]">
                    <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} className="h-4 w-4" />
                    Mark this testimonial as featured
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => reviewMutation.mutate({ id: selected.id, status: "APPROVED" })} disabled={reviewMutation.isPending} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">Approve</button>
                    <button type="button" onClick={() => reviewMutation.mutate({ id: selected.id, status: "REJECTED" })} disabled={reviewMutation.isPending} className="h-11 rounded-full border border-rose-200 px-5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">Reject</button>
                  </div>
                </div>
              ) : (
                <EmptyState title="Select a testimonial" description="Choose one submission from the list to approve or reject it." />
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="No testimonials found" description="No testimonial matches the current filters yet." />
        )}
      </div>
    </SectionWrapper>
  );
}
