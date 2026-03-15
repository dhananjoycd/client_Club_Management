import { CalendarDays, LayoutDashboard, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";

export default function HomePage() {
  return (
    <main className="px-4 py-10 text-[var(--color-foreground)] sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Club Management System"
          title="A structured frontend foundation for public visitors, members, and administrators."
          description="The platform is now organized around reusable layouts and shared UI primitives so each area can be built with consistent spacing, states, and presentation."
          actions={<StatusBadge label="Foundation Ready" variant="active" />}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Public experience"
            value="Responsive"
            description="Navigation and public layout are ready for informational pages and application flow."
            icon={<CalendarDays className="h-5 w-5" />}
          />
          <StatCard
            label="Dashboard structure"
            value="Shared"
            description="Member and admin areas use the same shell to keep the interface practical and maintainable."
            icon={<LayoutDashboard className="h-5 w-5" />}
          />
          <StatCard
            label="Architecture status"
            value="Stable"
            description="Core UI building blocks are now available for pages, sections, status states, and summaries."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </section>

        <SectionWrapper
          title="Next page-building baseline"
          description="These reusable components reduce repeated markup before public pages, member screens, and admin pages are implemented."
        >
          <EmptyState
            title="Feature pages are not added yet"
            description="The next phase will start building the actual public routes like About, Events, Notices, and Apply using the shared layout and UI patterns created so far."
          />
        </SectionWrapper>
      </div>
    </main>
  );
}
