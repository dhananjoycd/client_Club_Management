"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  CalendarDays,
  MapPin,
  PencilLine,
  Search,
  Star,
  Ticket,
  ToggleLeft,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { eventSchema, EventSchema, MIN_PAID_EVENT_PRICE_BDT } from "@/schemas/event.schema";
import { eventService } from "@/services/event.service";
import { eventCategories, EventItem } from "@/types/event.types";

const defaultValues: EventSchema = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  capacity: 100,
  category: "Workshop",
  eventType: "FREE",
  price: 0,
  currency: "bdt",
  imageUrl: "",
  isFeatured: false,
  isRegistrationOpen: true,
  sendEmail: false,
};

const EVENTS_PER_PAGE = 10;

type BoardFilter = "ALL" | "UPCOMING" | "PAST" | "FEATURED" | "OPEN" | "CLOSED" | "FREE" | "PAID";

function truncateText(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trimEnd()}...`;
}

function EventFormFields({
  register,
  watch,
  errors,
  disabled,
}: {
  register: ReturnType<typeof useForm<EventSchema>>["register"];
  watch: ReturnType<typeof useForm<EventSchema>>["watch"];
  errors: ReturnType<typeof useForm<EventSchema>>["formState"]["errors"];
  disabled: boolean;
}) {
  const eventType = watch("eventType");

  return (
    <div className="grid gap-4">
      <FormField label="Title" error={errors.title} disabled={disabled} {...register("title")} />
      <FormTextarea label="Description" error={errors.description as never} disabled={disabled} {...register("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Location" error={errors.location} disabled={disabled} {...register("location")} />
        <FormField label="Event date" type="datetime-local" error={errors.eventDate} disabled={disabled} {...register("eventDate")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Capacity"
          type="number"
          error={errors.capacity as never}
          disabled={disabled}
          {...register("capacity", { valueAsNumber: true })}
        />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--color-primary)]">Category</span>
          <select className="input-base h-12 px-4 text-sm" disabled={disabled} {...register("category")}>
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--color-primary)]">Event type</span>
          <select className="input-base h-12 px-4 text-sm" disabled={disabled} {...register("eventType")}>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </label>
        <FormField
          label="Price"
          type="number"
          step="0.01"
          error={errors.price as never}
          disabled={disabled || eventType !== "PAID"}
          min={eventType === "PAID" ? MIN_PAID_EVENT_PRICE_BDT : 0}
          placeholder={eventType === "PAID" ? `Minimum ${MIN_PAID_EVENT_PRICE_BDT} BDT` : "0.00"}
          {...register("price", { valueAsNumber: true })}
        />
        <FormField label="Currency" value="BDT" disabled readOnly />
      </div>
      {eventType === "PAID" ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Paid events must be priced at least {MIN_PAID_EVENT_PRICE_BDT} BDT.
        </p>
      ) : null}
      <FormField label="Event image URL" error={errors.imageUrl} disabled={disabled} {...register("imageUrl")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--color-primary-strong)]">
          <input type="checkbox" className="h-4 w-4" disabled={disabled} {...register("isFeatured")} />
          Mark as featured event
        </label>
        <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--color-primary-strong)]">
          <input type="checkbox" className="h-4 w-4" disabled={disabled} {...register("isRegistrationOpen")} />
          Registration open
        </label>
      </div>
      <label className="flex items-start gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
        <input type="checkbox" className="mt-1 h-4 w-4" disabled={disabled} {...register("sendEmail")} />
        <span>
          <span className="block font-medium text-[var(--color-primary-strong)]">Send this event by email</span>
          If email is configured, XYZ Tech Club users and members will get this event update in their inbox too.
        </span>
      </label>
    </div>
  );
}

function getEventBadges(event: EventItem) {
  const isPast = new Date(event.eventDate).getTime() < Date.now();
  return {
    isPast,
    timing: isPast ? "Past" : "Upcoming",
    registration: event.isRegistrationOpen ? "Registration Open" : "Registration Closed",
    featured: event.isFeatured ? "Featured" : null,
    type: event.eventType === "PAID" ? "Paid" : "Free",
  };
}

export function AdminEventsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<BoardFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const eventsQuery = useQuery({
    queryKey: queryKeys.events.admin,
    queryFn: () => eventService.getEvents({ limit: 100 }),
    retry: false,
  });

  const events = useMemo(() => eventsQuery.data?.data.result ?? [], [eventsQuery.data]);
  const createForm = useForm<EventSchema>({ resolver: zodResolver(eventSchema), defaultValues });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const isPast = new Date(event.eventDate).getTime() < Date.now();
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch) ||
        event.description.toLowerCase().includes(normalizedSearch) ||
        (event.category ?? "").toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "UPCOMING":
          return !isPast;
        case "PAST":
          return isPast;
        case "FEATURED":
          return Boolean(event.isFeatured);
        case "OPEN":
          return Boolean(event.isRegistrationOpen);
        case "CLOSED":
          return !event.isRegistrationOpen;
        case "FREE":
          return (event.eventType ?? "FREE") === "FREE";
        case "PAID":
          return event.eventType === "PAID";
        default:
          return true;
      }
    });
  }, [activeFilter, events, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const paginatedEvents = filteredEvents.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

  const invalidateEventQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events.admin }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events.publicList("all") }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Event created successfully.");
      createForm.reset(defaultValues);
      setIsCreateOpen(false);
      await invalidateEventQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Event creation failed.")),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EventSchema> }) => eventService.updateEvent(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Event updated successfully.");
      await invalidateEventQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Event update failed.")),
  });

  const deleteMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Event deleted successfully.");
      setPendingDeleteId(null);
      await invalidateEventQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Event deletion failed.")),
  });

  const handleCreateEvent: SubmitHandler<EventSchema> = (values) => {
    createMutation.mutate(values);
  };

  return (
    <>
      <div className="grid gap-6">
        <SectionWrapper
          title="New event"
          description="Open the event form only when you are ready to publish a new club activity."
        >
          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => setIsCreateOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] px-5 py-4 text-left transition hover:border-[var(--color-accent)] hover:bg-white"
              aria-expanded={isCreateOpen}
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Open event form</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{isCreateOpen ? "Hide the event form once you are done creating activities." : "Open the event form to publish a new XYZ Tech Club activity."}</p>
              </div>
              <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-4 text-base font-semibold text-[var(--color-primary)]">
                {isCreateOpen ? "-" : "+"}
              </span>
            </button>
            {isCreateOpen ? (
              <form className="grid gap-4" onSubmit={createForm.handleSubmit(handleCreateEvent)} noValidate>
                <EventFormFields
                  register={createForm.register}
                  watch={createForm.watch}
                  errors={createForm.formState.errors}
                  disabled={createMutation.isPending}
                />
                <FormActions
                  isSubmitting={createMutation.isPending}
                  submitLabel="Create event"
                  helperText="Free and paid events both appear in the XYZ Tech Club event board below after creation."
                />
              </form>
            ) : null}
          </div>
        </SectionWrapper>

        <SectionWrapper
          title="Event board"
          description="Manage XYZ Tech Club workshops, seminars, hackathons, and other activities from one event board."
        >
          <div className="grid gap-5">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search events</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <input
                      name="admin-event-search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search XYZ Tech Club events by title, location, category, or description"
                      className="input-base h-12 w-full min-w-0 pl-11 pr-4 text-sm"
                    />
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {([
                    ["ALL", "All"],
                    ["UPCOMING", "Upcoming"],
                    ["PAST", "Past"],
                    ["FEATURED", "Featured"],
                    ["OPEN", "Open"],
                    ["CLOSED", "Closed"],
                    ["FREE", "Free"],
                    ["PAID", "Paid"],
                  ] as const).map(([value, label]) => (
                    <FilterChip
                      key={value}
                      label={label}
                      active={activeFilter === value}
                      onClick={() => setActiveFilter(value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {eventsQuery.isLoading ? (
              <LoadingState title="Loading event board" description="Preparing the XYZ Tech Club events your admin team can manage." />
            ) : eventsQuery.isError ? (
              <EmptyState title="Unable to load events" description={getApiErrorMessage(eventsQuery.error, "Please verify your admin session.")} />
            ) : !filteredEvents.length ? (
              <EmptyState
                title={searchTerm || activeFilter !== "ALL" ? "No matching events" : "No events found"}
                description={
                  searchTerm || activeFilter !== "ALL"
                    ? "Try a different keyword or filter to find the event you want to manage."
                    : "Create an event to start managing the public events page."
                }
              />
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  {paginatedEvents.map((event) => {
                    const badges = getEventBadges(event);
                    const registrationsCount = event._count?.registrations ?? event.registrations?.length ?? 0;
                    const featuredCardClass = event.isFeatured
                      ? "border-[var(--color-accent)] bg-[linear-gradient(180deg,rgba(14,165,233,0.08),rgba(255,255,255,0.96))] ring-1 ring-[rgba(14,165,233,0.18)]"
                      : "border-[var(--color-border)] bg-[var(--color-page)]";

                    return (
                      <article
                        key={event.id}
                        className={`flex h-full flex-col rounded-[1.75rem] p-5 transition hover:border-[var(--color-accent)] hover:bg-white ${featuredCardClass}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            {event.isFeatured ? (
                              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,165,233,0.24)] bg-[rgba(14,165,233,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                Spotlight event
                              </span>
                            ) : null}
                            <h3 className="text-xl font-semibold text-[var(--color-primary)]">{event.title}</h3>
                            <div className="flex flex-wrap gap-2 xl:justify-end">
                              <StatusBadge label={badges.timing} variant={badges.isPast ? "inactive" : "pending"} className="w-fit text-[10px]" />
                              <StatusBadge label={badges.registration} variant={event.isRegistrationOpen ? "info" : "inactive"} className="w-fit text-[10px]" />
                              <StatusBadge label={badges.type} variant={event.eventType === "PAID" ? "pending" : "active"} className="w-fit text-[10px]" />
                              {badges.featured ? <StatusBadge label={badges.featured} variant="active" className="w-fit text-[10px]" /> : null}
                              {event.category ? <StatusBadge label={event.category} variant="default" className="w-fit text-[10px]" /> : null}
                            </div>
                          </div>
                          {event.imageUrl ? (
                            <div className="h-16 w-20 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-slate-100">
                              <Image src={event.imageUrl} alt={event.title} width={80} height={64} className="h-full w-full object-cover" />
                            </div>
                          ) : null}
                        </div>

                        <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">
                          {truncateText(event.description, 120)}
                        </p>

                        <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted-foreground)] sm:grid-cols-2">
                          <div className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-[var(--color-secondary)]" />
                            <span>{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
                            <span>{event.location}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                            <span>{registrationsCount} / {event.capacity} registered</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-[var(--color-secondary)]" />
                            <span>{event.eventType === "PAID" ? `${event.price ?? 0} BDT` : "Free event"}</span>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <Link href={`/admin/events/${event.id}/edit`} className="secondary-button h-11 px-4 text-sm">
                            <span className="inline-flex items-center gap-2">
                              <PencilLine className="h-4 w-4" />
                              Edit Event
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: event.id,
                                payload: { isFeatured: !event.isFeatured },
                              })
                            }
                            className="secondary-button h-11 px-4 text-sm"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              {event.isFeatured ? "Unfeature" : "Feature"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: event.id,
                                payload: { isRegistrationOpen: !event.isRegistrationOpen },
                              })
                            }
                            className="secondary-button h-11 px-4 text-sm"
                          >
                            <span className="inline-flex items-center gap-2">
                              <ToggleLeft className="h-4 w-4" />
                              {event.isRegistrationOpen ? "Close" : "Open"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(event.id)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </SectionWrapper>
      </div>


      <WarningConfirmModal
        open={Boolean(pendingDeleteId)}
        title="Delete this event?"
        description="This action will remove the event from admin and public views. This cannot be undone."
        confirmLabel="Delete event"
        isLoading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            deleteMutation.mutate(pendingDeleteId);
          }
        }}
      />
    </>
  );
}
