import { PublicEventsList } from "@/features/events/components/public-events-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export default function EventsPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Events"
          title="Upcoming event information connected to the backend event module."
          description="This page now fetches upcoming events from the real API and uses the same card-based presentation for a clean public experience."
        />

        <SectionWrapper
          title="Upcoming events"
          description="Event data is loaded from the backend and rendered in a public-friendly layout."
        >
          <PublicEventsList />
        </SectionWrapper>
      </div>
    </main>
  );
}
