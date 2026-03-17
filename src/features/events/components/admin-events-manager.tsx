"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { eventSchema, EventSchema } from "@/schemas/event.schema";
import { eventService } from "@/services/event.service";
import { eventCategories } from "@/types/event.types";

const defaultValues: EventSchema = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  capacity: 100,
  category: "Workshop",
  eventType: "FREE",
  price: 0,
  currency: "usd",
  imageUrl: "",
  isFeatured: false,
  isRegistrationOpen: true,
};

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function EventFormFields({ register, watch, errors, disabled }: { register: ReturnType<typeof useForm<EventSchema>>["register"]; watch: ReturnType<typeof useForm<EventSchema>>["watch"]; errors: ReturnType<typeof useForm<EventSchema>>["formState"]["errors"]; disabled: boolean; }) {
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
        <FormField label="Capacity" type="number" error={errors.capacity as never} disabled={disabled} {...register("capacity", { valueAsNumber: true })} />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--color-primary)]">Category</span>
          <select className="input-base" disabled={disabled} {...register("category")}>
            {eventCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 sm:col-span-1">
          <span className="text-sm font-medium text-[var(--color-primary)]">Event type</span>
          <select className="input-base" disabled={disabled} {...register("eventType")}>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </label>
        <FormField label="Price" type="number" step="0.01" error={errors.price as never} disabled={disabled || eventType !== "PAID"} {...register("price", { valueAsNumber: true })} />
        <FormField label="Currency" error={errors.currency} disabled={disabled || eventType !== "PAID"} {...register("currency")} />
      </div>
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
    </div>
  );
}

export function AdminEventsManager() {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const eventsQuery = useQuery({ queryKey: queryKeys.events.admin, queryFn: () => eventService.getEvents({ limit: 50 }), retry: false });
  const events = useMemo(() => eventsQuery.data?.data.result ?? [], [eventsQuery.data]);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0] ?? null;

  const createForm = useForm<EventSchema>({ resolver: zodResolver(eventSchema), defaultValues });
  const editForm = useForm<EventSchema>({ resolver: zodResolver(eventSchema), defaultValues });

  useEffect(() => {
    if (!selectedEventId && events[0]) setSelectedEventId(events[0].id);
  }, [events, selectedEventId]);

  useEffect(() => {
    if (selectedEvent) {
      editForm.reset({
        title: selectedEvent.title,
        description: selectedEvent.description,
        location: selectedEvent.location,
        eventDate: toDatetimeLocal(selectedEvent.eventDate),
        capacity: selectedEvent.capacity,
        category: selectedEvent.category ?? "Workshop",
        eventType: selectedEvent.eventType ?? "FREE",
        price: selectedEvent.price ?? 0,
        currency: selectedEvent.currency ?? "usd",
        imageUrl: selectedEvent.imageUrl ?? "",
        isFeatured: selectedEvent.isFeatured ?? false,
        isRegistrationOpen: selectedEvent.isRegistrationOpen ?? true,
      });
    }
  }, [editForm, selectedEvent]);

  const invalidateEventQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events.admin }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events.publicList("all") }),
    ]);
  };

  const createMutation = useMutation({ mutationFn: eventService.createEvent, onSuccess: async (response) => { toast.success(response.message ?? "Event created successfully."); createForm.reset(defaultValues); await invalidateEventQueries(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Event creation failed.")) });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<EventSchema> }) => eventService.updateEvent(id, payload), onSuccess: async (response) => { toast.success(response.message ?? "Event updated successfully."); await invalidateEventQueries(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Event update failed.")) });
  const deleteMutation = useMutation({ mutationFn: eventService.deleteEvent, onSuccess: async (response, deletedId) => { toast.success(response.message ?? "Event deleted successfully."); if (selectedEventId === deletedId) setSelectedEventId(null); await invalidateEventQueries(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Event deletion failed.")) });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <SectionWrapper title="Event management" description="Admins control category, free or paid type, featured state, Stripe-ready pricing, and registration availability from here.">
        {eventsQuery.isLoading ? <LoadingState title="Loading events" description="Fetching event records." /> : eventsQuery.isError ? <EmptyState title="Unable to load events" description={getApiErrorMessage(eventsQuery.error, "Please verify your admin session.")} /> : events.length ? (
          <div className="grid gap-4">
            {events.map((event) => {
              const isPast = new Date(event.eventDate).getTime() < Date.now();
              return (
                <button key={event.id} type="button" onClick={() => setSelectedEventId(event.id)} className={`flex w-full flex-col gap-4 rounded-[1.5rem] border p-5 text-left transition md:flex-row md:items-center md:justify-between ${selectedEvent?.id === event.id ? "border-[var(--color-accent)] bg-[var(--color-primary-soft)] shadow-sm" : "border-[var(--color-border)] bg-[var(--color-page)] hover:border-[var(--color-accent)]"}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[var(--color-primary)]">{event.title}</h3>
                      {event.isFeatured ? <StatusBadge label="Featured" variant="active" className="text-[10px]" /> : null}
                      <StatusBadge label={event.isRegistrationOpen ? "Registration Open" : "Closed"} variant={event.isRegistrationOpen ? "info" : "inactive"} className="text-[10px]" />
                      <StatusBadge label={isPast ? "Past" : "Upcoming"} variant={isPast ? "inactive" : "pending"} className="text-[10px]" />
                      {event.eventType ? <StatusBadge label={event.eventType} variant={event.eventType === "PAID" ? "pending" : "active"} className="text-[10px]" /> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{event.location}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                      {event.category ? <span>{event.category}</span> : null}
                      <span>{event.eventType === "PAID" ? `${event.price ?? 0} ${event.currency?.toUpperCase()}` : "Free"}</span>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(event.id); }} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Delete</button>
                </button>
              );
            })}
          </div>
        ) : <EmptyState title="No events found" description="Create an event to start managing the public events page." />}
      </SectionWrapper>

      <div className="grid gap-6">
        <SectionWrapper title="Create event" description="Free and paid events both support category, image, featured state, and registration control.">
          <form className="grid gap-4" onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))} noValidate>
            <EventFormFields register={createForm.register} watch={createForm.watch} errors={createForm.formState.errors} disabled={createMutation.isPending} />
            <FormActions isSubmitting={createMutation.isPending} submitLabel="Create event" helperText="Paid events redirect to Stripe checkout when users register." />
          </form>
        </SectionWrapper>

        <SectionWrapper title="Edit selected event" description="Update how the event appears publicly, whether it is free or paid, and whether Stripe checkout is required.">
          {selectedEvent ? (
            <form className="grid gap-4" onSubmit={editForm.handleSubmit((values) => updateMutation.mutate({ id: selectedEvent.id, payload: values }))} noValidate>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-4"><p className="text-sm font-medium text-[var(--color-muted-foreground)]">Selected event</p><p className="mt-2 text-lg font-semibold text-[var(--color-primary)]">{selectedEvent.title}</p></div>
              <EventFormFields register={editForm.register} watch={editForm.watch} errors={editForm.formState.errors} disabled={updateMutation.isPending} />
              <FormActions isSubmitting={updateMutation.isPending} submitLabel="Save changes" helperText="Category, event type, and payment settings update the public page immediately." />
            </form>
          ) : <EmptyState title="No event selected" description="Select an event from the list to edit its public presentation and registration settings." />}
        </SectionWrapper>
      </div>
    </div>
  );
}
