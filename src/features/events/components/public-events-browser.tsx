"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarRange, Clock3, MapPin, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { MotionReveal } from "@/components/motion/motion-shell";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ActionLoadingOverlay } from "@/components/shared/action-loading-overlay";
import { FilterChip } from "@/components/shared/filter-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { truncateText } from "@/lib/text";
import { authService } from "@/services/auth.service";
import { accountService } from "@/services/account.service";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { EventItem } from "@/types/event.types";
import { RegistrationStatus } from "@/types/registration.types";

function getRegistrationCount(event: EventItem) {
  if (typeof event._count?.registrations === "number") {
    return event._count.registrations;
  }

  return event.registrations?.filter((item) => item.status !== "CANCELLED").length ?? 0;
}

function getEventStatus(event: EventItem) {
  return new Date(event.eventDate).getTime() >= Date.now() ? "upcoming" : "past";
}

function getRegistrationLabel(status?: RegistrationStatus) {
  if (status === "WAITLISTED") return "Waitlisted";
  if (status === "REGISTERED") return "Registered";
  if (status === "CANCELLED") return "Register Again";
  return null;
}

const EVENTS_PER_PAGE = 10;

export function PublicEventsBrowser() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past" | "free" | "paid">("all");
  const [pendingEvent, setPendingEvent] = useState<EventItem | null>(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const eventsQuery = useQuery({
    queryKey: queryKeys.events.publicList("all"),
    queryFn: () => eventService.getEvents({ limit: 100 }),
  });
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const user = sessionQuery.data?.data?.user;
  const isPrivilegedUser = ["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"].includes(user?.role ?? "");
  const registrationsQuery = useQuery({
    queryKey: queryKeys.registrations.all,
    queryFn: () => registrationService.getRegistrations({ limit: 100 }),
    enabled: Boolean(user) && !isPrivilegedUser,
    retry: false,
  });
  const accountProfileQuery = useQuery({
    queryKey: queryKeys.account.profile,
    queryFn: accountService.getProfile,
    enabled: Boolean(user) && !isPrivilegedUser,
    retry: false,
  });

  const registrationByEvent = useMemo(() => {
    const items = registrationsQuery.data?.data.result ?? [];
    return new Map(items.map((item) => [item.event.id, item]));
  }, [registrationsQuery.data]);

  const registerMutation = useMutation({
    mutationFn: eventService.registerForEvent,
  });

  const allEvents = eventsQuery.data?.data.result ?? [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEvents = allEvents.filter((event) => {
    const status = getEventStatus(event);
    const eventType = (event.eventType ?? "FREE").toLowerCase();
    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "free" || activeFilter === "paid"
          ? eventType === activeFilter
          : status === activeFilter;
    const matchesSearch = normalizedSearch
      ? [event.title, event.location, event.description, event.category ?? ""].some((value) => value.toLowerCase().includes(normalizedSearch))
      : true;

    return matchesFilter && matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter((event) => getEventStatus(event) === "upcoming");
  const pastEvents = filteredEvents.filter((event) => getEventStatus(event) === "past").sort((a, b) => +new Date(b.eventDate) - +new Date(a.eventDate));
  const featuredEvent = upcomingEvents.find((event) => event.isFeatured) ?? upcomingEvents[0];
  const upcomingGrid = upcomingEvents.slice(featuredEvent ? 1 : 0);
  const upcomingDisplayEvents = featuredEvent ? upcomingGrid : upcomingEvents;
  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingDisplayEvents.length / EVENTS_PER_PAGE));
  const pastTotalPages = Math.max(1, Math.ceil(pastEvents.length / EVENTS_PER_PAGE));
  const paginatedUpcomingEvents = upcomingDisplayEvents.slice((upcomingPage - 1) * EVENTS_PER_PAGE, upcomingPage * EVENTS_PER_PAGE);
  const paginatedPastEvents = pastEvents.slice((pastPage - 1) * EVENTS_PER_PAGE, pastPage * EVENTS_PER_PAGE);

  useEffect(() => {
    setUpcomingPage(1);
    setPastPage(1);
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    if (upcomingPage > upcomingTotalPages) {
      setUpcomingPage(upcomingTotalPages);
    }
  }, [upcomingPage, upcomingTotalPages]);

  useEffect(() => {
    if (pastPage > pastTotalPages) {
      setPastPage(pastTotalPages);
    }
  }, [pastPage, pastTotalPages]);

  if (eventsQuery.isLoading) {
    return <LoadingState title="Loading club events" description="Preparing live XYZ Tech Club events, filters, and featured activities." />;
  }

  if (eventsQuery.isError) {
    return <EmptyState title="Unable to load events" description={getApiErrorMessage(eventsQuery.error, "Please try again later.")} />;
  }

  const getRegistrationWarningContent = (event: EventItem) => {
    const isFull = getRegistrationCount(event) >= event.capacity;

    return {
      title: event.eventType === "PAID" ? "Review payment before continuing" : "Confirm your registration",
      description:
        event.eventType === "PAID"
          ? `You are about to continue to Stripe to pay ${event.price ?? 0} BDT for this event. Please confirm that your profile details are correct before proceeding.`
          : "You are about to register for this event using your saved profile details. Please confirm that everything is correct before continuing.",
      confirmLabel: event.eventType === "PAID" ? "Continue to Stripe" : isFull ? "Join Waitlist" : "Confirm Registration",
    };
  };

  const openRegistrationWarning = (event: EventItem) => setPendingEvent(event);

  const closeRegistrationWarning = () => {
    if (registerMutation.isPending) return;
    setPendingEvent(null);
  };

  const confirmRegistration = () => {
    if (!pendingEvent) return;
    registerMutation.mutate(pendingEvent.id, {
      onSuccess: async (response, eventId) => {
        setPendingEvent(null);
        if (response.data?.requiresPayment && response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
          return;
        }
        toast.success(response.message ?? "Registration completed.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.events.publicList("all") }),
          queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.account.profile }),
        ]);
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Event registration failed.")),
    });
  };

  const actionLoadingState =
    registerMutation.isPending && pendingEvent
      ? {
          title: pendingEvent.eventType === "PAID" ? "Preparing secure checkout" : "Confirming your registration",
          description:
            pendingEvent.eventType === "PAID"
              ? "Please wait while we prepare your Stripe checkout session for this event."
              : "Please wait while we save your event registration and refresh your account data.",
        }
      : null;

  const renderRegisterAction = (event: EventItem) => {
    const registration = registrationByEvent.get(event.id);
    const registrationLabel = getRegistrationLabel(registration?.status);
    const isPast = getEventStatus(event) === "past";
    const isFull = getRegistrationCount(event) >= event.capacity;
    const isRegistrationOpen = event.isRegistrationOpen !== false;
    const isCancelledRegistration = registration?.status === "CANCELLED";

    if (registration?.paymentVerificationStatus === "PENDING_VERIFICATION") {
      return (
        <button type="button" disabled className="secondary-button h-11 w-full cursor-not-allowed px-5 text-sm opacity-70 sm:w-auto">
          Payment Verification Pending
        </button>
      );
    }

    if (
      registrationLabel &&
      (registration?.paymentVerificationStatus === "VERIFIED" || registration?.paymentVerificationStatus === "NOT_APPLICABLE")
    ) {
      return user ? (
        <Link href="/account/registrations" className="secondary-button h-11 w-full px-5 text-sm sm:w-auto">
          {registrationLabel}
        </Link>
      ) : (
        <button type="button" disabled className="secondary-button h-11 w-full cursor-not-allowed px-5 text-sm opacity-70 sm:w-auto">
          {registrationLabel}
        </button>
      );
    }

    if (isCancelledRegistration) {
      return (
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <button type="button" onClick={() => openRegistrationWarning(event)} disabled={registerMutation.isPending && registerMutation.variables === event.id} className="primary-button h-11 w-full px-5 text-sm sm:w-auto">
            {registerMutation.isPending && registerMutation.variables === event.id
              ? "Registering..."
              : event.eventType === "PAID"
                ? `Register Again - Pay ${event.price ?? 0} BDT`
                : "Register Again"}
          </button>
          <p className="text-xs leading-5 text-[var(--color-muted-foreground)]">Your previous registration was cancelled, so you can submit a new one from here.</p>
        </div>
      );
    }

    if (!user) {
      return (
        <Link href="/login" className="secondary-button h-11 w-full px-5 text-sm sm:w-auto">
          Login to Register
        </Link>
      );
    }

    if (isPrivilegedUser) {
      return (
        <button type="button" disabled className="secondary-button h-11 w-full cursor-not-allowed px-5 text-sm opacity-70 sm:w-auto">
          Admin accounts cannot register
        </button>
      );
    }

    const accountProfile = accountProfileQuery.data?.data;

    if (!accountProfileQuery.isLoading && accountProfile && !accountProfile.profileComplete) {
      return (
        <button type="button" onClick={() => router.push(`/account/profile?redirect=${encodeURIComponent(pathname || "/events")}`)} className="secondary-button h-11 w-full px-5 text-sm sm:w-auto">
          Complete Profile First
        </button>
      );
    }

    if (!isRegistrationOpen) {
      return (
        <button type="button" disabled className="secondary-button h-11 w-full cursor-not-allowed px-5 text-sm opacity-70 sm:w-auto">
          Registration Closed
        </button>
      );
    }

    if (isPast) {
      return (
        <button type="button" disabled className="secondary-button h-11 w-full cursor-not-allowed px-5 text-sm opacity-70 sm:w-auto">
          Event Closed
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openRegistrationWarning(event)}
        disabled={registerMutation.isPending && registerMutation.variables === event.id}
        className="primary-button h-11 w-full px-5 text-sm sm:w-auto"
      >
        {registerMutation.isPending && registerMutation.variables === event.id
          ? "Registering..."
          : event.eventType === "PAID"
            ? `Pay ${event.price ?? 0} BDT`
            : isFull
              ? "Join Waitlist"
              : "Register Now"}
      </button>
    );
  };
  return (
    <div className="grid gap-6">
      <MotionReveal>
        <section className="surface-card rounded-[2rem] p-5 sm:p-7">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Browse events</p>
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">Browse upcoming and past events</h2>
            </div>
            <div className="flex flex-wrap gap-3 xl:justify-end">
              {(["all", "upcoming", "past", "free", "paid"] as const).map((filter) => (
                <FilterChip
                  key={filter}
                  label={
                    filter === "all"
                      ? "All Events"
                      : filter === "upcoming"
                        ? "Upcoming"
                        : filter === "past"
                          ? "Past Events"
                          : filter === "free"
                            ? "Free"
                            : "Paid"
                  }
                  active={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className="h-11 px-5 text-sm"
                />
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by event title, location, or topic"
                className="input-base h-12 pl-11 pr-4 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-3 xl:flex">
              <div className="min-w-[120px] rounded-[1rem] app-card-soft px-4 py-3 text-center">
                <p className="text-xl font-semibold text-[var(--color-primary-strong)]">{upcomingEvents.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">Upcoming</p>
              </div>
              <div className="min-w-[120px] rounded-[1rem] app-card-soft px-4 py-3 text-center">
                <p className="text-xl font-semibold text-[var(--color-primary-strong)]">{pastEvents.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">Past</p>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      {featuredEvent ? (
        <MotionReveal>
          <section className="overflow-hidden rounded-[2rem] border border-[rgba(125,211,252,0.22)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.2)] sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label="Featured Event" variant="active" className="bg-white/14 text-white" />
                  {featuredEvent.category ? <StatusBadge label={featuredEvent.category} variant="info" className="bg-white/14 text-white" /> : null}
                  <StatusBadge label={featuredEvent.isRegistrationOpen === false ? "Registration Closed" : "Registration Open"} variant={featuredEvent.isRegistrationOpen === false ? "inactive" : "pending"} className="bg-white/14 text-white" />
                </div>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{featuredEvent.title}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">{truncateText(featuredEvent.description, 180)}</p>
                <div className="mt-5 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4" />
                    <span>{format(new Date(featuredEvent.eventDate), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    <span>{format(new Date(featuredEvent.eventDate), "hh:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{getRegistrationCount(featuredEvent)} / {featuredEvent.capacity} registered</span>
                  </div>
                </div>
              </div>
              <div className="order-1 surface-card rounded-[1.75rem] p-5 text-[var(--color-foreground)] sm:p-6 lg:order-2">
                {featuredEvent.imageUrl ? (
                  <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-[1.25rem]">
                    <Image src={featuredEvent.imageUrl} alt={featuredEvent.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 28vw" unoptimized />
                  </div>
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Event actions</p>
                <div className="mt-4 flex flex-col gap-3">
                  {renderRegisterAction(featuredEvent)}
                  <Link href={`/events/${featuredEvent.id}`} className="secondary-button h-11 w-full px-5 text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </MotionReveal>
      ) : null}

      <MotionReveal>
        <section className="surface-card rounded-[2rem] p-5 sm:p-7">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">Upcoming events</h2>
            <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">Upcoming activities stay fully dynamic because admins control events from the backend dashboard.</p>
          </div>
          {upcomingEvents.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {paginatedUpcomingEvents.map((event) => (
                <article key={event.id} className="flex h-full flex-col rounded-[1.75rem] border border-[rgba(148,163,184,0.18)] bg-white/72 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[rgba(37,99,235,0.18)] hover:bg-white hover:shadow-[0_18px_36px_rgba(37,99,235,0.10)] sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label="Upcoming" variant="info" className="text-[10px]" />
                      {event.category ? <StatusBadge label={event.category} variant="default" className="text-[10px]" /> : null}
                      {event.eventType ? <StatusBadge label={event.eventType === "PAID" ? `Paid ${event.price ?? 0} BDT` : "Free"} variant={event.eventType === "PAID" ? "pending" : "active"} className="text-[10px]" /> : null}
                      {event.isFeatured ? <StatusBadge label="Featured" variant="active" className="text-[10px]" /> : null}
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{format(new Date(event.eventDate), "dd MMM yyyy")}</p>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{event.title}</h3>
                  {event.imageUrl ? (
                    <div className="relative mt-4 h-44 overflow-hidden rounded-[1.25rem]">
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 22vw" unoptimized />
                    </div>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{truncateText(event.description, 70)}</p>
                  <div className="mt-5 grid flex-1 content-start gap-2 text-sm text-[var(--color-muted-foreground)]">
                    <div className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1">
                      <span className="font-semibold text-[var(--color-primary-strong)]">Location:</span>
                      <span className="min-w-0">{event.location}</span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1">
                      <span className="font-semibold text-[var(--color-primary-strong)]">Time:</span>
                      <span className="min-w-0">{format(new Date(event.eventDate), "hh:mm a")}</span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1">
                      <span className="font-semibold text-[var(--color-primary-strong)]">Seats:</span>
                      <span className="min-w-0">{getRegistrationCount(event)} / {event.capacity}</span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1">
                      <span className="font-semibold text-[var(--color-primary-strong)]">Registration:</span>
                      <span className="min-w-0">{event.isRegistrationOpen === false ? "Closed" : "Open"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1">
                      <span className="font-semibold text-[var(--color-primary-strong)]">Type:</span>
                      <span className="min-w-0">{event.eventType === "PAID" ? `${event.price ?? 0} BDT` : "Free"}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex w-full justify-center pt-6">
                    <div className="flex w-full max-w-xs flex-col items-center gap-3">
                      {renderRegisterAction(event)}
                      <Link href={`/events/${event.id}`} className="secondary-button h-11 w-full px-5 text-sm">
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No events found" description="Try a different filter or search term. Upcoming events will appear here once admins publish them." />
          )}
          <PaginationControls currentPage={upcomingPage} totalPages={upcomingTotalPages} onPageChange={setUpcomingPage} className="mt-6" />
        </section>
      </MotionReveal>

      <MotionReveal>
        <section className="surface-card rounded-[2rem] p-5 sm:p-7">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">Past events</h2>
            <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">Past events help visitors see club continuity and the kind of work that already happened.</p>
          </div>
          {pastEvents.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {paginatedPastEvents.map((event) => (
                <article key={event.id} className="flex h-full flex-col rounded-[1.5rem] border border-[rgba(148,163,184,0.16)] bg-white/68 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[rgba(37,99,235,0.16)] hover:bg-white hover:shadow-[0_16px_32px_rgba(37,99,235,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[var(--color-primary-strong)]">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label="Completed" variant="inactive" className="text-[10px]" />
                      {event.category ? <StatusBadge label={event.category} variant="default" className="text-[10px]" /> : null}
                      {event.eventType ? <StatusBadge label={event.eventType === "PAID" ? `Paid ${event.price ?? 0} BDT` : "Free"} variant={event.eventType === "PAID" ? "pending" : "active"} className="text-[10px]" /> : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{truncateText(event.description, 70)}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-muted-foreground)]">
                    <span>{format(new Date(event.eventDate), "dd MMM yyyy")}</span>
                    <span>{event.location}</span>
                    <span>{getRegistrationCount(event)} joined</span>
                  </div>
                  <div className="mt-auto flex w-full justify-center pt-5">
                    <Link href={`/events/${event.id}`} className="secondary-button h-11 w-full max-w-xs px-5 text-sm">
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No past events yet" description="Past club activity will appear here after events are completed." />
          )}
          <PaginationControls currentPage={pastPage} totalPages={pastTotalPages} onPageChange={setPastPage} className="mt-6" />
        </section>
      </MotionReveal>

      <MotionReveal>
        <section className="surface-card-dark rounded-[2rem] p-6 text-white sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(164,233,240,0.72)]">Stay involved</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Follow the event calendar and join the next activity.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(226,232,240,0.8)] sm:text-base">
            Every public event shown here comes directly from the backend event module. Free events register instantly, and paid events redirect to Stripe checkout after the user profile is complete.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <MembershipApplyCta
              label="Apply for Membership"
              className="primary-button h-12 w-full px-6 text-sm sm:w-auto"
            />
            <Link href="/notices" className="secondary-button h-12 w-full border-white/14 bg-white/6 px-6 text-sm text-white hover:bg-white/10 hover:text-white sm:w-auto">
              Browse Notices
            </Link>
          </div>
        </section>
      </MotionReveal>
      <ActionLoadingOverlay open={Boolean(actionLoadingState)} title={actionLoadingState?.title ?? "Please wait"} description={actionLoadingState?.description ?? "Preparing your action."} />
      {pendingEvent ? (
        <WarningConfirmModal
          open={Boolean(pendingEvent)}
          title={getRegistrationWarningContent(pendingEvent).title}
          description={getRegistrationWarningContent(pendingEvent).description}
          confirmLabel={getRegistrationWarningContent(pendingEvent).confirmLabel}
          isLoading={registerMutation.isPending}
          onConfirm={confirmRegistration}
          onCancel={closeRegistrationWarning}
        />
      ) : null}
    </div>
  );
}

