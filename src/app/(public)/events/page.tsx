import { PublicEventsBrowser } from "@/features/events/components/public-events-browser";

export default function EventsPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <PublicEventsBrowser />
      </div>
    </main>
  );
}
