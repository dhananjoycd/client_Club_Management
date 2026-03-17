import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { settingsService } from "@/services/settings.service";
import { testimonialItems } from "@/features/home/home-content";
import { SiteTestimonial } from "@/types/settings.types";

async function getTestimonials(): Promise<SiteTestimonial[]> {
  try {
    const result = await settingsService.getSettings();
    const configuredTestimonials = result.data?.testimonials ?? [];

    if (configuredTestimonials.length > 0) {
      return configuredTestimonials;
    }
  } catch {
    // Fall back to bundled content when the settings endpoint is unavailable.
  }

  return testimonialItems;
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  const featuredTestimonial = testimonials[0];
  const remainingTestimonials = testimonials.slice(1);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Testimonials"
          title="What members, participants, and mentors say about XYZ Tech Club."
          description="These testimonials are managed from settings, so the page can stay current without redesigning the public landing experience."
          actions={
            <MembershipApplyCta
              label="Join the Club"
              className="primary-button h-11 px-5 text-sm"
            />
          }
        />

        <SectionWrapper
          title="Featured testimonial"
          description="Strong social proof helps visitors understand the club through real experiences, not just promotional copy."
        >
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(125,211,252,0.26)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.2)] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,199,214,0.18),transparent_26%)]" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(214,240,255,0.82)]">Featured voice</p>
                  <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                    &ldquo;{featuredTestimonial?.quote}&rdquo;
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-white">{featuredTestimonial?.author}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgba(214,240,255,0.78)]">{featuredTestimonial?.meta}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {remainingTestimonials.map((item) => (
                <article key={item.author} className="surface-card flex h-full flex-col justify-between rounded-[1.75rem] p-5 sm:p-6">
                  <p className="text-sm leading-7 text-[var(--color-foreground)] sm:text-base">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                    <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{item.author}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                  </div>
                </article>
              ))}
              <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-white/55 p-5 sm:p-6 md:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Keep the section current</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
                  Super admin can update these testimonials from the settings page, so this public route always stays aligned with the latest club feedback.
                </p>
                <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                  Back to home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </main>
  );
}
