"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  CalendarDays,
  Ban,
  Clock3,
  Mail,
  MapPin,
  PencilLine,
  Search,
  Star,
  Ticket,
  ToggleLeft,
  Trash2,
  X,
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
import { getPaymentStatusLabel, getPaymentVerificationStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-display";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { eventSchema, EventSchema, MIN_PAID_EVENT_PRICE_BDT } from "@/schemas/event.schema";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { eventCategories, EventItem } from "@/types/event.types";
import { RegistrationItem } from "@/types/registration.types";

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

type EnrollmentEmailComposer = {
  subject: string;
  message: string;
};

type EnrollmentEmailRecipients = {
  ids: string[];
  names: string[];
  count: number;
};

type SendEventEnrollmentEmailPayload = {
  registrationIds: string[];
  subject: string;
  message: string;
};

function getEmailComposerDefaults(eventTitle: string) {
  return {
    subject: `XYZ Tech Club: Update for ${eventTitle}`,
    message: `Hello participants,\n\nThis is a message regarding "${eventTitle}".\n\n[Write your message here]\n\nThanks,\nXYZ Tech Club`,
  };
}

function createEmailRecipients(registrations: RegistrationItem[]): EnrollmentEmailRecipients {
  return {
    ids: registrations.map((registration) => registration.id),
    names: registrations.map((registration) => getRegistrantName(registration)),
    count: registrations.length,
  };
}

function createEmailPayload(composer: EnrollmentEmailComposer, recipients: EnrollmentEmailRecipients): SendEventEnrollmentEmailPayload {
  return {
    registrationIds: recipients.ids,
    subject: composer.subject,
    message: composer.message,
  };
}

function createRecipientSummary(names: string[], maxItems = 3) {
  if (!names.length) return "No recipients selected";
  if (names.length <= maxItems) return names.join(", ");
  return `${names.slice(0, maxItems).join(", ")} +${names.length - maxItems} more`;
}

function getRegistrantName(registration: RegistrationItem) {
  return registration.member?.user?.name ?? registration.user?.name ?? registration.snapshotName ?? "Unnamed participant";
}

function getRegistrantEmail(registration: RegistrationItem) {
  return registration.member?.user?.email ?? registration.user?.email ?? registration.snapshotEmail ?? "No email provided";
}

function hasRegistrantEmail(registration: RegistrationItem) {
  return getRegistrantEmail(registration) !== "No email provided";
}

function isEmailableRegistration(registration: RegistrationItem) {
  return registration.status !== "CANCELLED" && hasRegistrantEmail(registration);
}

function getRecipientEmails(registrations: RegistrationItem[]) {
  return Array.from(
    new Set(
      registrations
        .map((registration) => getRegistrantEmail(registration))
        .filter((email) => email && email !== "No email provided"),
    ),
  );
}

function createMailtoLink(recipientEmails: string[], composer: EnrollmentEmailComposer) {
  const searchParams = new URLSearchParams();

  // Put a club-controlled mailbox in To so recipient emails stay hidden in BCC.
  searchParams.set("to", "hello@xyztechclub.org");

  if (recipientEmails.length) {
    searchParams.set("bcc", recipientEmails.join(","));
  }

  searchParams.set("subject", composer.subject);
  searchParams.set("body", composer.message);

  return `mailto:?${searchParams.toString()}`;
}

function isEnrollmentEmailRouteUnavailable(error: unknown) {
  return axios.isAxiosError(error) && [404, 405, 501].includes(error.response?.status ?? 0);
}

function getRegistrationVariant(status: RegistrationItem["status"]) {
  switch (status) {
    case "REGISTERED":
      return "active";
    case "WAITLISTED":
      return "pending";
    case "CANCELLED":
    default:
      return "inactive";
  }
}

function getPaymentVariant(status?: RegistrationItem["paymentStatus"] | null) {
  switch (status) {
    case "PAID":
    case "NOT_REQUIRED":
      return "active";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "inactive";
    case "REFUNDED":
    case undefined:
    default:
      return "default";
  }
}

function getVerificationVariant(status?: RegistrationItem["paymentVerificationStatus"] | null) {
  switch (status) {
    case "VERIFIED":
      return "active";
    case "PENDING_VERIFICATION":
      return "pending";
    case "FAILED":
      return "inactive";
    case "NOT_APPLICABLE":
    case undefined:
    default:
      return "default";
  }
}

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
          <span className="text-sm font-medium text-(--color-primary)">Category</span>
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
          <span className="text-sm font-medium text-(--color-primary)">Event type</span>
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
        <p className="text-sm text-(--color-muted-foreground)">
          Paid events must be priced at least {MIN_PAID_EVENT_PRICE_BDT} BDT.
        </p>
      ) : null}
      <FormField label="Event image URL" error={errors.imageUrl} disabled={disabled} {...register("imageUrl")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl app-card-soft px-4 py-3 text-sm font-medium text-(--color-primary-strong)">
          <input type="checkbox" className="h-4 w-4" disabled={disabled} {...register("isFeatured")} />
          Mark as featured event
        </label>
        <label className="flex items-center gap-3 rounded-2xl app-card-soft px-4 py-3 text-sm font-medium text-(--color-primary-strong)">
          <input type="checkbox" className="h-4 w-4" disabled={disabled} {...register("isRegistrationOpen")} />
          Registration open
        </label>
      </div>
      <label className="flex items-start gap-3 rounded-2xl app-card-soft px-4 py-3 text-sm text-(--color-muted-foreground)">
        <input type="checkbox" className="mt-1 h-4 w-4" disabled={disabled} {...register("sendEmail")} />
        <span>
          <span className="block font-medium text-(--color-primary-strong)">Send this event by email</span>
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [pendingCancelRegistrationId, setPendingCancelRegistrationId] = useState<string | null>(null);
  const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<string[]>([]);
  const [visibleRegistrationCount, setVisibleRegistrationCount] = useState(8);
  const [emailComposer, setEmailComposer] = useState<EnrollmentEmailComposer | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const eventsQuery = useQuery({
    queryKey: queryKeys.events.admin,
    queryFn: () => eventService.getEvents({ limit: 100 }),
    retry: false,
  });

  const events = useMemo(() => eventsQuery.data?.data.result ?? [], [eventsQuery.data]);
  const registrationsQuery = useQuery({
    queryKey: queryKeys.registrations.all,
    queryFn: () => registrationService.getRegistrations({ limit: 1000 }),
    retry: false,
  });
  const registrations = useMemo(() => registrationsQuery.data?.data.result ?? [], [registrationsQuery.data]);
  const registrationsByEvent = useMemo(() => {
    const map = new Map<string, RegistrationItem[]>();

    for (const registration of registrations) {
      const current = map.get(registration.event.id) ?? [];
      current.push(registration);
      map.set(registration.event.id, current);
    }

    return map;
  }, [registrations]);
  const createForm = useForm<EventSchema>({ resolver: zodResolver(eventSchema), defaultValues });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events
      .filter((event) => {
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
      })
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }

        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
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

  const deleteMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Event deleted successfully.");
      setPendingDeleteId(null);
      await invalidateEventQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Event deletion failed.")),
  });

  const cancelRegistrationMutation = useMutation({
    mutationFn: registrationService.cancelRegistration,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Enrollment cancelled successfully.");
      setPendingCancelRegistrationId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events.admin }),
      ]);
      registrationsQuery.refetch();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Enrollment cancellation failed.")),
  });

  const openMailClientFallback = (composer: EnrollmentEmailComposer) => {
    if (!selectedRecipientEmails.length) {
      toast.error("No email addresses are available for the selected participants.");
      return;
    }

    window.location.href = createMailtoLink(selectedRecipientEmails, composer);
    setEmailComposer(null);
  };

  const sendEmailMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SendEventEnrollmentEmailPayload }) => eventService.sendEventEnrollmentEmail(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Email sent successfully.");
      setEmailComposer(null);
      setSelectedRegistrationIds([]);
    },
    onError: (error) => {
      if (emailComposer && isEnrollmentEmailRouteUnavailable(error)) {
        toast.info("Direct email sending is not enabled on this API yet. Opening your mail app instead.");
        openMailClientFallback(emailComposer);
        return;
      }

      toast.error(getApiErrorMessage(error, "Email could not be sent."));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EventSchema> }) => eventService.updateEvent(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Event updated successfully.");
      await invalidateEventQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Event update failed.")),
  });

  const handleCreateEvent: SubmitHandler<EventSchema> = (values) => {
    createMutation.mutate(values);
  };

  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) ?? null : null;
  const selectedEventRegistrations = useMemo(
    () => (selectedEventId ? registrationsByEvent.get(selectedEventId) ?? [] : []),
    [registrationsByEvent, selectedEventId],
  );

  useEffect(() => {
    setSelectedRegistrationIds([]);
    setEmailComposer(null);
    setVisibleRegistrationCount(8);
  }, [selectedEventId]);

  useEffect(() => {
    setSelectedRegistrationIds((current) =>
      current.filter((id) => selectedEventRegistrations.some((registration) => registration.id === id && isEmailableRegistration(registration))),
    );
  }, [selectedEventRegistrations]);

  const emailableRegistrations = useMemo(
    () => selectedEventRegistrations.filter(isEmailableRegistration),
    [selectedEventRegistrations],
  );

  const selectedRecipientRegistrations = useMemo(
    () => selectedEventRegistrations.filter((registration) => selectedRegistrationIds.includes(registration.id)),
    [selectedEventRegistrations, selectedRegistrationIds],
  );

  const selectedRecipients = useMemo(
    () => createEmailRecipients(selectedRecipientRegistrations),
    [selectedRecipientRegistrations],
  );

  const selectedRecipientEmails = useMemo(
    () => getRecipientEmails(selectedRecipientRegistrations),
    [selectedRecipientRegistrations],
  );

  const allRecipientsSelected = emailableRegistrations.length > 0 && selectedRecipients.count === emailableRegistrations.length;
  const visibleRegistrations = selectedEventRegistrations.slice(0, visibleRegistrationCount);
  const hasMoreRegistrations = visibleRegistrationCount < selectedEventRegistrations.length;

  const openEmailComposer = () => {
    if (!selectedRecipients.count) {
      toast.error("At least one participant must be selected.");
      return;
    }

    if (!selectedRecipientEmails.length) {
      toast.error("The selected participants do not have any email addresses available.");
      return;
    }

    setEmailComposer(getEmailComposerDefaults(selectedEvent?.title ?? "Selected event"));
  };

  const handleEmailComposerSubmit = () => {
    if (!selectedEvent || !emailComposer || !selectedRecipients.count) return;

    sendEmailMutation.mutate({
      id: selectedEvent.id,
      payload: createEmailPayload(emailComposer, selectedRecipients),
    });
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
              className="flex w-full items-center justify-between gap-4 rounded-3xl border border-(--color-border) bg-(--color-page) px-5 py-4 text-left transition hover:border-(--color-accent) hover:bg-white"
              aria-expanded={isCreateOpen}
            >
              <div>
                <p className="text-sm font-semibold text-(--color-primary-strong)">Open event form</p>
                <p className="mt-1 text-sm leading-6 text-(--color-muted-foreground)">{isCreateOpen ? "Hide the event form once you are done creating activities." : "Open the event form to publish a new XYZ Tech Club activity."}</p>
              </div>
              <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full app-card-subtle px-4 text-base font-semibold text-(--color-primary)">
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
            <div className="rounded-3xl border border-(--color-border) bg-(--color-page) p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-(--color-primary-strong)">Search events</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-muted-foreground)" />
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
                    const registrationsCount = registrationsByEvent.get(event.id)?.length ?? event._count?.registrations ?? event.registrations?.length ?? 0;
                    const featuredCardClass = event.isFeatured
                      ? "border-(--color-accent) bg-[linear-gradient(180deg,rgba(14,165,233,0.08),rgba(255,255,255,0.96))] ring-1 ring-[rgba(14,165,233,0.18)] dark:border-[rgba(56,189,248,0.5)] dark:bg-[linear-gradient(180deg,rgba(8,47,73,0.74),rgba(15,23,42,0.92))] dark:ring-[rgba(56,189,248,0.26)]"
                      : "border-(--color-border) bg-(--color-page)";

                    return (
                      <article
                        key={event.id}
                        className={`flex h-full flex-col rounded-[1.75rem] p-5 transition hover:border-(--color-accent) hover:bg-white dark:hover:bg-slate-900/70 ${featuredCardClass}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            {event.isFeatured ? (
                              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,165,233,0.24)] bg-[rgba(14,165,233,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary) dark:border-[rgba(125,211,252,0.5)] dark:bg-[rgba(12,74,110,0.5)] dark:text-sky-100">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                Spotlight event
                              </span>
                            ) : null}
                            <h3 className="text-xl font-semibold text-(--color-primary)">{event.title}</h3>
                            <div className="flex flex-wrap gap-2 xl:justify-end">
                              <StatusBadge label={badges.timing} variant={badges.isPast ? "inactive" : "pending"} className="w-fit text-[10px]" />
                              <StatusBadge label={badges.registration} variant={event.isRegistrationOpen ? "info" : "inactive"} className="w-fit text-[10px]" />
                              <StatusBadge label={badges.type} variant={event.eventType === "PAID" ? "pending" : "active"} className="w-fit text-[10px]" />
                              {badges.featured ? <StatusBadge label={badges.featured} variant="active" className="w-fit text-[10px]" /> : null}
                              {event.category ? <StatusBadge label={event.category} variant="default" className="w-fit text-[10px]" /> : null}
                            </div>
                          </div>
                          {event.imageUrl ? (
                            <div className="h-16 w-20 overflow-hidden rounded-2xl border border-(--color-border) bg-slate-100">
                              <Image src={event.imageUrl} alt={event.title} width={80} height={64} className="h-full w-full object-cover" />
                            </div>
                          ) : null}
                        </div>

                        <p className="mt-4 text-sm leading-6 text-(--color-muted-foreground)">
                          {truncateText(event.description, 120)}
                        </p>

                        <div className="mt-5 grid gap-3 text-sm text-(--color-muted-foreground) sm:grid-cols-2">
                          <div className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-(--color-secondary)" />
                            <span>{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-(--color-secondary)" />
                            <span>{event.location}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4 text-(--color-secondary)" />
                            <span>{registrationsCount} / {event.capacity} registered</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-(--color-secondary)" />
                            <span>{event.eventType === "PAID" ? `${event.price ?? 0} BDT` : "Free event"}</span>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEventId(event.id)}
                            className="secondary-button h-11 w-full px-4 text-sm sm:col-span-2"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              View Enrollments
                              <span className="inline-flex min-w-11 items-center justify-center rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-semibold text-(--color-primary-strong)">
                                {registrationsCount}
                              </span>
                            </span>
                          </button>
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

      {selectedEvent ? (
        <div className="fixed inset-0 z-[120] overflow-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="event-enrollments-title">
          <div className="mx-auto my-auto w-full max-w-6xl rounded-4xl border border-(--color-border) bg-(--color-page) p-4 shadow-[0_28px_80px_rgba(2,8,23,0.45)] sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-(--color-border) pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-secondary)">Enrollment details</p>
                <h2 id="event-enrollments-title" className="mt-2 text-2xl font-semibold tracking-tight text-(--color-primary-strong) sm:text-3xl">{selectedEvent.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-(--color-muted-foreground)">People who enrolled for this event. Use the table to review status, contact a person, or cancel a registration if needed.</p>
              </div>
              <button type="button" onClick={() => setSelectedEventId(null)} className="secondary-button h-11 w-11 px-0" aria-label="Close enrollments modal">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl app-card-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Total enrollments</p>
                <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{selectedEventRegistrations.length}</p>
              </div>
              <div className="rounded-3xl app-card-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Registered</p>
                <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{selectedEventRegistrations.filter((item) => item.status === "REGISTERED").length}</p>
              </div>
              <div className="rounded-3xl app-card-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Waitlisted</p>
                <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{selectedEventRegistrations.filter((item) => item.status === "WAITLISTED").length}</p>
              </div>
              <div className="rounded-3xl app-card-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Cancelled</p>
                <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{selectedEventRegistrations.filter((item) => item.status === "CANCELLED").length}</p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-(--color-border) bg-(--color-background)">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-(--color-border) text-left text-sm">
                  <thead className="bg-(--color-page) text-xs uppercase tracking-[0.18em] text-(--color-muted-foreground)">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        <button type="button" onClick={() => setSelectedRegistrationIds(allRecipientsSelected ? [] : emailableRegistrations.map((registration) => registration.id))} className="secondary-button h-9 px-3 text-[11px] uppercase tracking-[0.16em]">
                          {allRecipientsSelected ? "Clear all" : "Select all"}
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold">Participant</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Registered at</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--color-border)">
                    {selectedEventRegistrations.length ? (
                      visibleRegistrations.map((registration) => {
                        const isSelected = selectedRegistrationIds.includes(registration.id);
                        const canSelectRecipient = isEmailableRegistration(registration);

                        return (
                          <tr key={registration.id} className="align-top">
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                disabled={!canSelectRecipient}
                                onClick={() =>
                                  setSelectedRegistrationIds((current) =>
                                    current.includes(registration.id)
                                      ? current.filter((id) => id !== registration.id)
                                      : [...current, registration.id],
                                  )
                                }
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-45 ${isSelected ? "border-(--color-accent) bg-(--color-accent-soft) text-(--color-accent)" : "border-(--color-border) bg-(--color-page) text-(--color-muted-foreground)"}`}
                                aria-pressed={isSelected}
                                aria-label={`${isSelected ? "Deselect" : "Select"} ${getRegistrantName(registration)}`}
                              >
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-(--color-accent) bg-(--color-accent) text-white" : "border-(--color-border) bg-(--color-page)"}`}>
                                  {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
                                </span>
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-(--color-primary-strong)">{getRegistrantName(registration)}</p>
                                <p className="text-sm text-(--color-muted-foreground)">{getRegistrantEmail(registration)}</p>
                                {!canSelectRecipient ? (
                                  <p className="text-xs text-amber-700">
                                    {registration.status === "CANCELLED" ? "Cancelled registrations are excluded from email sends." : "No email address is available for this participant."}
                                  </p>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <StatusBadge label={getRegistrationStatusLabel(registration.status)} variant={getRegistrationVariant(registration.status)} />
                                {getPaymentStatusLabel(registration.paymentStatus) ? (
                                  <StatusBadge label={getPaymentStatusLabel(registration.paymentStatus) as string} variant={getPaymentVariant(registration.paymentStatus)} />
                                ) : null}
                                {getPaymentVerificationStatusLabel(registration.paymentVerificationStatus) ? (
                                  <StatusBadge label={getPaymentVerificationStatusLabel(registration.paymentVerificationStatus) as string} variant={getVerificationVariant(registration.paymentVerificationStatus)} />
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-(--color-muted-foreground)">
                              <div className="space-y-1">
                                <p className="font-medium text-(--color-primary-strong)">{registration.paymentStatus ?? "NOT_REQUIRED"}</p>
                                <p>{registration.paymentVerificationStatus ?? "NOT_APPLICABLE"}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-(--color-muted-foreground)">
                              <div className="inline-flex items-center gap-2">
                                <Clock3 className="h-4 w-4" />
                                <span>{format(new Date(registration.registeredAt), "dd MMM yyyy, hh:mm a")}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                disabled={registration.status === "CANCELLED" || cancelRegistrationMutation.isPending}
                                onClick={() => setPendingCancelRegistrationId(registration.id)}
                                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Ban className="h-4 w-4" />
                                {registration.status === "CANCELLED" ? "Cancelled" : "Cancel enrollment"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-(--color-muted-foreground)">
                          No enrollments found for this event yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {hasMoreRegistrations ? (
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <p className="text-sm text-(--color-muted-foreground)">
                  Showing {Math.min(visibleRegistrationCount, selectedEventRegistrations.length)} of {selectedEventRegistrations.length}
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleRegistrationCount((current) => current + 8)}
                  className="secondary-button h-11 px-5 text-sm"
                >
                  Load more participants
                </button>
              </div>
            ) : null}

            <div className="mt-5 rounded-[1.5rem] border border-(--color-border) bg-(--color-page) p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_auto] lg:items-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-(--color-primary-strong)">{selectedRecipients.count} participant{selectedRecipients.count === 1 ? "" : "s"} selected</p>
                  <p className="text-sm leading-6 text-(--color-muted-foreground)">{createRecipientSummary(selectedRecipients.names)}</p>
                  <p className="text-xs leading-5 text-(--color-muted-foreground)">
                    Only active registrations with an email address can receive contact emails.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <button
                    type="button"
                    onClick={openEmailComposer}
                    disabled={!selectedRecipients.count || sendEmailMutation.isPending}
                    className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact selected
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {emailComposer ? (
        <div className="fixed inset-0 z-[220] overflow-auto bg-slate-950/65 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="enrollment-mail-title">
          <div className="surface-card mx-auto my-auto w-full max-w-2xl rounded-[2rem] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-secondary)">Contact message</p>
                <h3 id="enrollment-mail-title" className="mt-2 text-xl font-semibold tracking-tight text-(--color-primary-strong)">Send contact email</h3>
                <p className="mt-1 text-sm text-(--color-muted-foreground)">
                  {selectedRecipients.count} selected participant{selectedRecipients.count === 1 ? "" : "s"}
                </p>
              </div>
              <button type="button" onClick={() => setEmailComposer(null)} className="secondary-button h-10 w-10 px-0" aria-label="Close email composer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-(--color-border) bg-(--color-page) p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Recipients</p>
              <p className="mt-2 text-sm leading-6 text-(--color-primary-strong)">{createRecipientSummary(selectedRecipients.names, 4)}</p>
              <p className="mt-2 text-xs leading-5 text-(--color-muted-foreground)">
                If direct email sending is not available on your API yet, we will open your default mail app with the recipients, subject, and message filled in.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-(--color-primary-strong)">Subject</span>
                <input
                  value={emailComposer.subject}
                  onChange={(event) => setEmailComposer((current) => (current ? { ...current, subject: event.target.value } : current))}
                  className="input-base h-12 px-4 text-sm"
                  placeholder="Write a subject"
                />
              </label>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-(--color-primary-strong)">Email message</span>
              <textarea
                value={emailComposer.message}
                onChange={(event) => setEmailComposer((current) => (current ? { ...current, message: event.target.value } : current))}
                rows={9}
                className="input-base min-h-[180px] px-4 py-3 text-sm leading-6"
                placeholder="Write your message..."
              />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleEmailComposerSubmit}
                disabled={!emailComposer.subject.trim() || !emailComposer.message.trim() || sendEmailMutation.isPending}
                className="primary-button h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
              </button>
              <button type="button" onClick={() => setEmailComposer(null)} className="secondary-button h-11 px-4 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}


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

      <WarningConfirmModal
        open={Boolean(pendingCancelRegistrationId)}
        title="Cancel this enrollment?"
        description="This will mark the registration as cancelled. Use this only when the participant should no longer remain enrolled in the event."
        confirmLabel="Cancel enrollment"
        isLoading={cancelRegistrationMutation.isPending}
        onCancel={() => setPendingCancelRegistrationId(null)}
        onConfirm={() => {
          if (pendingCancelRegistrationId) {
            cancelRegistrationMutation.mutate(pendingCancelRegistrationId);
          }
        }}
      />
    </>
  );
}

