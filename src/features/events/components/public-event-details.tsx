"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarRange, Clock3, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { MotionReveal } from "@/components/motion/motion-shell";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { accountService } from "@/services/account.service";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { RegistrationStatus } from "@/types/registration.types";

type PublicEventDetailsProps = {
  eventId: string;
};

function getActiveRegistrationCount(count?: number, registrations?: Array<{ status: RegistrationStatus }>) {
  if (typeof count === "number") return count;
  return registrations?.filter((item) => item.status !== "CANCELLED").length ?? 0;
}

export function PublicEventDetails({ eventId }: PublicEventDetailsProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const eventQuery = useQuery({ queryKey: queryKeys.events.detail(eventId), queryFn: () => eventService.getEventById(eventId) });
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

  const currentRegistrationStatus = useMemo(() => {
    const items = registrationsQuery.data?.data.result ?? [];
    return items.find((item) => item.event.id === eventId)?.status;
  }, [eventId, registrationsQuery.data]);

  const registerMutation = useMutation({
    mutationFn: eventService.registerForEvent,
  });

  if (eventQuery.isLoading) {
    return <LoadingState title="Loading event" description="Fetching event details from the backend." />;
  }

  if (eventQuery.isError) {
    return <EmptyState title="Unable to load event" description={getApiErrorMessage(eventQuery.error, "Please try again later.")} />;
  }

  const event = eventQuery.data?.data;

  if (!event) {
    return <EmptyState title="Event not found" description="The requested event could not be found." />;
  }

  const isPast = new Date(event.eventDate).getTime() < Date.now();
  const registrationCount = getActiveRegistrationCount(event._count?.registrations, event.registrations);
  const isFull = registrationCount >= event.capacity;
  const isRegistrationOpen = event.isRegistrationOpen !== false;

  const warningContent = {
    title: event.eventType === "PAID" ? "Review payment before continuing" : "Confirm your registration",
    description:
      event.eventType === "PAID"
        ? `You are about to continue to Stripe to pay ${event.price ?? 0} ${event.currency?.toUpperCase() ?? "USD"} for this event. Please confirm that your profile details are correct before proceeding.`
        : "You are about to register for this event using your saved profile details. Please confirm that everything is correct before continuing.",
    confirmLabel: event.eventType === "PAID" ? "Continue to Stripe" : isFull ? "Join Waitlist" : "Confirm Registration",
  };

  const openRegistrationWarning = () => setIsWarningOpen(true);

  const closeRegistrationWarning = () => {
    if (registerMutation.isPending) return;
    setIsWarningOpen(false);
  };

  const confirmRegistration = () => {
    registerMutation.mutate(event.id, {
      onSuccess: async (response) => {
        setIsWarningOpen(false);
        if (response.data?.requiresPayment && response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
          return;
        }
        toast.success(response.message ?? "Registration completed.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.account.profile }),
        ]);
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Event registration failed.")),
    });
  };

  const renderRegisterAction = () => {
    if (currentRegistrationStatus === "REGISTERED" || currentRegistrationStatus === "WAITLISTED") {
      return user ? (
        <Link href="/account/registrations" className="secondary-button h-12 w-full px-6 text-sm sm:w-auto">
          {currentRegistrationStatus === "WAITLISTED" ? "View Waitlist" : "View Registration"}
        </Link>
      ) : (
        <button type="button" disabled className="secondary-button h-12 w-full cursor-not-allowed px-6 text-sm opacity-70 sm:w-auto">
          {currentRegistrationStatus === "WAITLISTED" ? "Waitlisted" : "Registered"}
        </button>
      );
    }

    if (!user) {
      return (
        <Link href="/login" className="secondary-button h-12 w-full px-6 text-sm sm:w-auto">
          Login to Register
        </Link>
      );
    }

    if (isPrivilegedUser) {
      return (
        <button type="button" disabled className="secondary-button h-12 w-full cursor-not-allowed px-6 text-sm opacity-70 sm:w-auto">
          Admin accounts cannot register
        </button>
      );
    }

    const accountProfile = accountProfileQuery.data?.data;

    if (!accountProfileQuery.isLoading && accountProfile && !accountProfile.profileComplete) {
      return (
        <button type="button" onClick={() => router.push(`/account/profile?redirect=${encodeURIComponent(pathname || `/events/${event.id}`)}`)} className="secondary-button h-12 w-full px-6 text-sm sm:w-auto">
          Complete Profile First
        </button>
      );
    }

    if (!isRegistrationOpen) {
      return (
        <button type="button" disabled className="secondary-button h-12 w-full cursor-not-allowed px-6 text-sm opacity-70 sm:w-auto">
          Registration Closed
        </button>
      );
    }

    if (isPast) {
      return (
        <button type="button" disabled className="secondary-button h-12 w-full cursor-not-allowed px-6 text-sm opacity-70 sm:w-auto">
          Event Closed
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={openRegistrationWarning}
        disabled={registerMutation.isPending}
        className="primary-button h-12 w-full px-6 text-sm sm:w-auto"
      >
        {registerMutation.isPending ? "Registering..." : event.eventType === "PAID" ? `Pay ${event.price ?? 0} ${event.currency?.toUpperCase() ?? "USD"}` : isFull ? "Join Waitlist" : "Register Now"}
      </button>
    );
  };

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <MotionReveal>
          <section className="overflow-hidden rounded-[2rem] border border-[rgba(125,211,252,0.22)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.2)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={isPast ? "Past Event" : "Upcoming Event"} variant={isPast ? "inactive" : "active"} className="bg-white/14 text-white" />
                  {event.category ? <StatusBadge label={event.category} variant="info" className="bg-white/14 text-white" /> : null}
                  {event.eventType ? <StatusBadge label={event.eventType === "PAID" ? `Paid ${event.price ?? 0} ${event.currency?.toUpperCase() ?? "USD"}` : "Free Event"} variant={event.eventType === "PAID" ? "pending" : "active"} className="bg-white/14 text-white" /> : null}
                  <StatusBadge label={isRegistrationOpen ? "Registration Open" : "Registration Closed"} variant={isRegistrationOpen ? "pending" : "inactive"} className="bg-white/14 text-white" />
                  {event.isFeatured ? <StatusBadge label="Featured" variant="active" className="bg-white/14 text-white" /> : null}
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82 sm:text-base">{event.description}</p>
                {event.imageUrl ? (
                  <div className="relative mt-5 h-56 overflow-hidden rounded-[1.5rem] border border-white/12 sm:h-72">
                    <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" unoptimized />
                  </div>
                ) : null}
              </div>
              <div className="surface-card rounded-[1.75rem] p-5 text-[var(--color-foreground)] sm:min-w-[260px] sm:p-6">
                <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
                  <div className="flex items-center gap-2"><CalendarRange className="h-4 w-4 text-[var(--color-primary)]" /><span>{format(new Date(event.eventDate), "dd MMM yyyy")}</span></div>
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--color-primary)]" /><span>{format(new Date(event.eventDate), "hh:mm a")}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--color-primary)]" /><span>{event.location}</span></div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[var(--color-primary)]" /><span>{registrationCount} / {event.capacity} registered</span></div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  {renderRegisterAction()}
                  <Link href="/events" className="secondary-button h-12 w-full px-6 text-sm">Back to Events</Link>
                </div>
              </div>
            </div>
          </section>
        </MotionReveal>

        <MotionReveal>
          <section className="surface-card rounded-[2rem] p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: "Date", value: format(new Date(event.eventDate), "dd MMM yyyy") },
                { label: "Time", value: format(new Date(event.eventDate), "hh:mm a") },
                { label: "Location", value: event.location },
                { label: "Capacity", value: `${registrationCount} / ${event.capacity}` },
                { label: "Category", value: event.category || "General" },
                { label: "Type", value: event.eventType === "PAID" ? `${event.price ?? 0} ${event.currency?.toUpperCase() ?? "USD"}` : "Free" },
                { label: "Registration", value: isRegistrationOpen ? "Open" : "Closed" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--color-primary-strong)]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </MotionReveal>
      </div>
      <WarningConfirmModal
        open={isWarningOpen}
        title={warningContent.title}
        description={warningContent.description}
        confirmLabel={warningContent.confirmLabel}
        isLoading={registerMutation.isPending}
        onConfirm={confirmRegistration}
        onCancel={closeRegistrationWarning}
      />
    </main>
  );
}
