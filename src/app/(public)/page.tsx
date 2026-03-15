import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Users } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";

const highlights = [
  {
    title: "Public information",
    description: "Visitors can explore the organization, understand its mission, and stay updated with activities.",
  },
  {
    title: "Member access",
    description: "Members will have structured dashboard access for profile, registration, and notice management.",
  },
  {
    title: "Administrative workflow",
    description: "Admins will manage applications, notices, events, and platform settings from a unified dashboard.",
  },
];

export default function HomePage() {
  return (
    <main className="px-4 py-10 text-[var(--color-foreground)] sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="District Association Platform"
          title="A clean and structured frontend for club and district association management."
          description="This platform is designed to support public visitors, student applicants, members, and administrators with a clear academic visual language and practical workflows."
          actions={<StatusBadge label="Public Site Ready" variant="active" />}
        />

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-white p-8 shadow-sm sm:p-10">
            <div className="max-w-3xl space-y-5">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-4xl">
                Build trust first, then guide users into member and admin experiences.
              </h2>
              <p className="text-base leading-7 text-[var(--color-muted-foreground)]">
                The public website now provides a professional foundation for presenting the organization,
                highlighting events and notices, and directing students to the membership application flow.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/apply"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
                >
                  Apply for Membership
                </Link>
                <Link
                  href="/about"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-primary)]"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <StatCard
              label="Members and applicants"
              value="Structured"
              description="Clear public-to-member journey with dedicated application and access pathways."
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Events and notices"
              value="Visible"
              description="Public users can discover current activities and official communication without friction."
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <StatCard
              label="Admin readiness"
              value="Reliable"
              description="The architecture is prepared for secure operational workflows and dashboard expansion."
              icon={<ShieldCheck className="h-5 w-5" />}
            />
          </div>
        </section>

        <SectionWrapper
          title="Platform direction"
          description="These sections establish the public-facing experience before member and admin data-driven pages are implemented."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                <h3 className="text-lg font-semibold text-[var(--color-primary)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
              Explore upcoming events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionWrapper>
      </div>
    </main>
  );
}
