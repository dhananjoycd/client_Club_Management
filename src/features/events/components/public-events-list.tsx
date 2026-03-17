"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, CalendarRange, MapPin, Users } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { truncateText } from "@/lib/text";
import { eventService } from "@/services/event.service";

export function PublicEventsList() {
  const eventsQuery = useQuery({
    queryKey: queryKeys.events.upcoming,
    queryFn: () => eventService.getEvents({ upcomingOnly: true, limit: 6 }),
  });

  if (eventsQuery.isLoading) {
    return <LoadingState title="Loading events" description="Fetching upcoming events from the backend." />;
  }

  if (eventsQuery.isError) {
    return <EmptyState title="Unable to load events" description={getApiErrorMessage(eventsQuery.error, "Please try again later.")} />;
  }

  const events = eventsQuery.data?.data.result ?? [];

  if (!events.length) {
    return <EmptyState title="No upcoming events" description="Upcoming events will appear here once they are published from the backend." />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {events.map((event, index) => (
        <article key={event.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--color-primary)]">{event.title}</h3>
            <StatusBadge
              label={index === 0 ? "Next up" : "Upcoming"}
              variant={index === 0 ? "active" : "info"}
              className="text-[10px]"
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{truncateText(event.description, 60)}</p>
          <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{format(new Date(event.eventDate), "dd MMMM yyyy, hh:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--color-primary)]" />
              <span>
                {event._count?.registrations ?? 0} / {event.capacity} registered
              </span>
            </div>
          </div>
          <div className="mt-5">
            <Link href={`/events/${event.id}`} className="secondary-button inline-flex h-10 items-center gap-2 px-4 text-sm">
              Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
