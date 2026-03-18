"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { accountService } from "@/services/account.service";
import { authService } from "@/services/auth.service";
import { testimonialService } from "@/services/testimonial.service";

const statusVariant = (status: string) => {
  if (status === "APPROVED") return "active" as const;
  if (status === "REJECTED") return "inactive" as const;
  return "pending" as const;
};

export function PublicTestimonialsView() {
  const queryClient = useQueryClient();
  const [quote, setQuote] = useState("");
  const [meta, setMeta] = useState("");
  const publicTestimonialsQuery = useQuery({ queryKey: queryKeys.testimonials.publicList, queryFn: testimonialService.getPublicTestimonials, retry: false });
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const profileQuery = useQuery({
    queryKey: queryKeys.account.profile,
    queryFn: accountService.getProfile,
    enabled: Boolean(sessionQuery.data?.data?.user),
    retry: false,
  });
  const myTestimonialsQuery = useQuery({
    queryKey: queryKeys.testimonials.mine,
    queryFn: testimonialService.getMyTestimonials,
    enabled: Boolean(sessionQuery.data?.data?.user),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: testimonialService.createTestimonial,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Testimonial submitted for admin review.");
      setQuote("");
      setMeta("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.publicList }),
        queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.mine }),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Testimonial submission failed.")),
  });

  if (publicTestimonialsQuery.isLoading) {
    return <LoadingState title="Loading testimonials" description="Preparing the latest member voices from XYZ Tech Club." />;
  }

  if (publicTestimonialsQuery.isError) {
    return <EmptyState title="Unable to load testimonials" description={getApiErrorMessage(publicTestimonialsQuery.error, "Please try again in a moment.")} />;
  }

  const testimonials = publicTestimonialsQuery.data?.data ?? [];
  const featured = testimonials[0];
  const others = testimonials.slice(1);
  const user = sessionQuery.data?.data?.user;
  const profile = profileQuery.data?.data;
  const myTestimonials = myTestimonialsQuery.data?.data ?? [];

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Testimonials"
          title="What members and participants say about XYZ Tech Club."
          description="Read approved community feedback and, if your profile is complete, send your own testimonial for admin review."
          actions={<MembershipApplyCta label="Join the Club" className="primary-button h-11 px-5 text-sm" />}
        />

        {featured ? (
          <SectionWrapper title="Featured testimonial" description="Real experiences help visitors understand the club through community voices.">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(125,211,252,0.26)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.2)] sm:p-8">
                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(214,240,255,0.82)]">Featured voice</p>
                    <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">&ldquo;{featured.quote}&rdquo;</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-white">{featured.authorName}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(214,240,255,0.78)]">{featured.meta}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {others.length ? others.map((item) => (
                  <article key={item.id} className="surface-card flex h-full flex-col justify-between rounded-[1.75rem] p-5 sm:p-6">
                    <p className="text-sm leading-7 text-[var(--color-foreground)] sm:text-base">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                      <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{item.authorName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-white/55 p-5 sm:p-6 md:col-span-2">
                    <p className="text-sm text-[var(--color-muted-foreground)]">More approved testimonials will appear here as admins review new submissions.</p>
                  </div>
                )}
              </div>
            </div>
          </SectionWrapper>
        ) : (
          <SectionWrapper title="Testimonials" description="Approved community feedback will appear here once admins review new submissions.">
            <EmptyState title="No approved testimonials yet" description="The first approved testimonial will appear here once a member submission is reviewed." />
          </SectionWrapper>
        )}

        <SectionWrapper title="Share your experience" description="Profile-complete users can submit one testimonial at a time for admin review.">
          {!user ? (
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-5 text-sm text-[var(--color-muted-foreground)]">
              Sign in to submit a testimonial for XYZ Tech Club.
            </div>
          ) : !profile?.profileComplete ? (
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Complete your profile first. Missing: {profile?.missingFields?.join(", ")}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Your recent submissions</p>
                <div className="mt-4 grid gap-3">
                  {myTestimonials.length ? myTestimonials.map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <StatusBadge label={item.status} variant={statusVariant(item.status)} />
                        <p className="text-xs text-[var(--color-muted-foreground)]">{new Date(item.createdAt).toLocaleDateString("en-GB")}</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-foreground)]">&ldquo;{item.quote}&rdquo;</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                      {item.reviewReason ? <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Admin note: {item.reviewReason}</p> : null}
                    </div>
                  )) : <p className="text-sm text-[var(--color-muted-foreground)]">No testimonial submissions yet.</p>}
                </div>
              </div>

              <form
                className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitMutation.mutate({ quote, meta });
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]"><MessageSquareQuote className="h-5 w-5" /></span>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--color-primary-strong)]">Submit a testimonial</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">Tell visitors what the club helped you learn, build, or experience.</p>
                  </div>
                </div>
                <label className="mt-5 grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-primary-strong)]">Short role or context</span>
                  <input value={meta} onChange={(event) => setMeta(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="Member, workshop participant, mentor..." />
                </label>
                <label className="mt-4 grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-primary-strong)]">Your testimonial</span>
                  <textarea value={quote} onChange={(event) => setQuote(event.target.value)} rows={6} className="input-base min-h-[180px] px-4 py-3 text-sm" placeholder="Share a real, specific experience from XYZ Tech Club..." />
                </label>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-xs text-[var(--color-muted-foreground)]">Admin will review this before it appears publicly.</p>
                  <button type="submit" disabled={submitMutation.isPending} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                    {submitMutation.isPending ? "Submitting..." : "Submit testimonial"}
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionWrapper>
      </div>
    </main>
  );
}
