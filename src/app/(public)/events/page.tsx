import { PageHeader } from "@/components/shared/page-header";
import { PublicEventsBrowser } from "@/features/events/components/public-events-browser";

export default function EventsPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Events"
          title="Browse club events in one place."
          description="This page reads live backend event data, so admins control what appears, members can register for active events, and visitors can explore upcoming sessions, featured activities, and past club momentum from one screen."
        />

        <PublicEventsBrowser />
      </div>
    </main>
  );
}
