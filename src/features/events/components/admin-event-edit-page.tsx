"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Mail } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { FormLoadingState } from "@/components/feedback/form-loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getPaymentStatusLabel, getPaymentVerificationStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-display";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { eventSchema, EventSchema, MIN_PAID_EVENT_PRICE_BDT } from "@/schemas/event.schema";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { eventCategories } from "@/types/event.types";
import { PaymentStatus, PaymentVerificationStatus, RegistrationItem, RegistrationStatus } from "@/types/registration.types";

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

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function getRegistrantName(registration: RegistrationItem) {
  return registration.member?.user?.name ?? registration.user?.name ?? registration.snapshotName ?? "Unnamed participant";
}

function getRegistrantEmail(registration: RegistrationItem) {
  return registration.member?.user?.email ?? registration.user?.email ?? registration.snapshotEmail ?? "No email provided";
}

function getRegistrationVariant(status: RegistrationStatus) {
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

function getPaymentVariant(status?: PaymentStatus | null) {
  switch (status) {
    case "PAID":
      return "active";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "inactive";
    case "REFUNDED":
    case "NOT_REQUIRED":
    case undefined:
    default:
      return "default";
  }
}

function getVerificationVariant(status?: PaymentVerificationStatus | null) {
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

type Props = {
  eventId: string;
};

export function AdminEventEditPage({ eventId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<EventSchema>({ resolver: zodResolver(eventSchema), defaultValues });

  const eventQuery = useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventService.getEventById(eventId),
    retry: false,
  });
  const registrationsQuery = useQuery({
    queryKey: [...queryKeys.registrations.all, "event", eventId] as const,
    queryFn: () => registrationService.getRegistrations({ limit: 1000 }),
    retry: false,
  });

  useEffect(() => {
    const event = eventQuery.data?.data;
    if (!event) return;

    form.reset({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: toDatetimeLocal(event.eventDate),
      capacity: event.capacity,
      category: event.category ?? "Workshop",
      eventType: event.eventType ?? "FREE",
      price: event.price ?? 0,
      currency: event.currency ?? "bdt",
      imageUrl: event.imageUrl ?? "",
      isFeatured: event.isFeatured ?? false,
      isRegistrationOpen: event.isRegistrationOpen ?? true,
      sendEmail: false,
    });
  }, [eventQuery.data, form]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<EventSchema>) => eventService.updateEvent(eventId, payload),
    onSuccess: async (response) => {
      const freshEvent = response.data;
      toast.success(response.message ?? "Event updated successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events.admin }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events.publicList("all") }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }),
      ]);
      queryClient.setQueryData(queryKeys.events.detail(eventId), { data: freshEvent, message: response.message, success: true });
      router.push("/admin/events");
      router.refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Event update failed.")),
  });

  const handleSubmit: SubmitHandler<EventSchema> = (values) => {
    updateMutation.mutate(values);
  };

  if (eventQuery.isLoading) {
    return <FormLoadingState title="Loading event editor" description="Preparing this XYZ Tech Club event for admin editing." />;
  }

  if (eventQuery.isError || !eventQuery.data?.data) {
    return <EmptyState title="Unable to load event" description={getApiErrorMessage(eventQuery.error, "This event could not be loaded for editing.")} />;
  }

  const event = eventQuery.data.data;
  const eventRegistrations = (registrationsQuery.data?.data.result ?? []).filter((registration) => registration.event.id === eventId);
  const registrationStats = {
    total: eventRegistrations.length,
    registered: eventRegistrations.filter((registration) => registration.status === "REGISTERED").length,
    waitlisted: eventRegistrations.filter((registration) => registration.status === "WAITLISTED").length,
    cancelled: eventRegistrations.filter((registration) => registration.status === "CANCELLED").length,
  };

  return (
    <SectionWrapper
      title="Edit event"
      description="Update XYZ Tech Club event details, pricing, registration state, and featured visibility from one dedicated editor."
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-(--color-border) bg-(--color-page) p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--color-muted-foreground)">Now editing</p>
            <h2 className="mt-2 text-2xl font-semibold text-(--color-primary-strong)">{event.title}</h2>
            <p className="mt-2 text-sm text-(--color-muted-foreground)">Scheduled for {format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
          </div>
          <Link href="/admin/events" className="secondary-button h-11 px-5 text-sm">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to event board
            </span>
          </Link>
        </div>

        <div id="enrolled-members">
          <SectionWrapper
            title="Enrolled members"
            description={`People who have already enrolled for ${event.title}. This list is pulled from the live registrations data for the event.`}
          >
            {registrationsQuery.isLoading ? (
            <LoadingState title="Loading enrolled members" description="Preparing the registration list for this event." />
            ) : registrationsQuery.isError ? (
            <EmptyState title="Unable to load registrations" description={getApiErrorMessage(registrationsQuery.error, "Please try again.")} />
            ) : eventRegistrations.length ? (
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl app-card-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Total enrollments</p>
                  <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{registrationStats.total}</p>
                </div>
                <div className="rounded-3xl app-card-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Registered</p>
                  <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{registrationStats.registered}</p>
                </div>
                <div className="rounded-3xl app-card-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Waitlisted</p>
                  <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{registrationStats.waitlisted}</p>
                </div>
                <div className="rounded-3xl app-card-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Cancelled</p>
                  <p className="mt-2 text-3xl font-semibold text-(--color-primary-strong)">{registrationStats.cancelled}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {eventRegistrations.map((registration) => {
                  const registrationStatusLabel = getRegistrationStatusLabel(registration.status);
                  const paymentStatusLabel = getPaymentStatusLabel(registration.paymentStatus);
                  const paymentVerificationLabel = getPaymentVerificationStatusLabel(registration.paymentVerificationStatus);

                  return (
                    <article key={registration.id} className="rounded-3xl app-card-subtle p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-(--color-primary-strong)">{getRegistrantName(registration)}</p>
                          <p className="inline-flex items-center gap-2 text-sm text-(--color-muted-foreground)">
                            <Mail className="h-4 w-4" />
                            {getRegistrantEmail(registration)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge label={registrationStatusLabel} variant={getRegistrationVariant(registration.status)} />
                          {paymentStatusLabel ? <StatusBadge label={paymentStatusLabel} variant={getPaymentVariant(registration.paymentStatus)} /> : null}
                          {paymentVerificationLabel ? <StatusBadge label={paymentVerificationLabel} variant={getVerificationVariant(registration.paymentVerificationStatus)} /> : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-(--color-border) bg-(--color-background) p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Registered at</p>
                          <p className="mt-2 text-sm font-semibold text-(--color-primary-strong)">{format(new Date(registration.registeredAt), "dd MMM yyyy, hh:mm a")}</p>
                        </div>
                        <div className="rounded-2xl border border-(--color-border) bg-(--color-background) p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted-foreground)">Profile source</p>
                          <p className="mt-2 text-sm font-semibold text-(--color-primary-strong)">
                            {registration.member?.membershipId ? `Member #${registration.member.membershipId}` : registration.user?.id ? "User account" : "Snapshot record"}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            ) : (
            <EmptyState title="No enrollments yet" description="Once users register for this event, they will appear here with their status and payment details." />
            )}
          </SectionWrapper>
        </div>

        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <EventFormFields register={form.register} watch={form.watch} errors={form.formState.errors} disabled={updateMutation.isPending} />
          <FormActions
            isSubmitting={updateMutation.isPending}
            submitLabel="Save changes"
            helperText="After saving, the event board and public event UI will reflect the updated data immediately."
            secondaryAction={
              <Link href="/admin/events" className="secondary-button h-11 px-5 text-sm">
                Cancel
              </Link>
            }
          />
        </form>
      </div>
    </SectionWrapper>
  );
}

