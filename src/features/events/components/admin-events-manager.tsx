"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

export function AdminEventsManager() {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({ queryKey: queryKeys.events.admin, queryFn: () => eventService.getEvents({ limit: 20 }), retry: false });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventSchema>({ resolver: zodResolver(eventSchema), defaultValues: { title: "", description: "", location: "", eventDate: "", capacity: 100 } });
  const events = eventsQuery.data?.data.result ?? [];
  const selectedEvent = events[0];

  const createMutation = useMutation({ mutationFn: eventService.createEvent, onSuccess: async (response) => { toast.success(response.message ?? "Event created successfully."); reset(); await queryClient.invalidateQueries({ queryKey: queryKeys.events.all }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Event creation failed.")) });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<EventSchema> }) => eventService.updateEvent(id, payload), onSuccess: async (response) => { toast.success(response.message ?? "Event updated successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.events.all }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Event update failed.")) });
  const deleteMutation = useMutation({ mutationFn: eventService.deleteEvent, onSuccess: async (response) => { toast.success(response.message ?? "Event deleted successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.events.all }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Event deletion failed.")) });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionWrapper title="Event management" description="Live event list from the backend CRUD module.">
        {eventsQuery.isLoading ? <LoadingState title="Loading events" description="Fetching event records." /> : eventsQuery.isError ? <EmptyState title="Unable to load events" description={getApiErrorMessage(eventsQuery.error, "Please verify your admin session.")} /> : (
          <div className="grid gap-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-primary)]">{event.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{event.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={index === 0 ? "Selected" : "Live"} variant={index === 0 ? "active" : "info"} className="w-fit" />
                  <button type="button" onClick={() => deleteMutation.mutate(event.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
      <div className="grid gap-6">
        <SectionWrapper title="Create event" description="Schema-driven event creation form wired to the backend.">
          <form className="grid gap-4" onSubmit={handleSubmit((values) => createMutation.mutate(values))} noValidate>
            <FormField label="Title" error={errors.title} disabled={createMutation.isPending} {...register("title")} />
            <FormTextarea label="Description" error={errors.description as never} disabled={createMutation.isPending} {...register("description")} />
            <FormField label="Location" error={errors.location} disabled={createMutation.isPending} {...register("location")} />
            <FormField label="Event date" type="datetime-local" error={errors.eventDate} disabled={createMutation.isPending} {...register("eventDate")} />
            <FormField label="Capacity" type="number" error={errors.capacity as never} disabled={createMutation.isPending} {...register("capacity", { valueAsNumber: true })} />
            <FormActions isSubmitting={createMutation.isPending} submitLabel="Create event" helperText="New events are posted directly to the backend event module." />
          </form>
        </SectionWrapper>
        <SectionWrapper title="Quick update selected event" description="Fast update action for the first loaded event record.">
          {selectedEvent ? (
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4">
                <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Selected event</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-primary)]">{selectedEvent.title}</p>
              </div>
              <button type="button" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: selectedEvent.id, payload: { title: `${selectedEvent.title} (Updated)` } })} className="h-11 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary)] disabled:opacity-50">Append Updated to title</button>
            </div>
          ) : <EmptyState title="No event selected" description="Create an event or load existing event data to use quick updates." />}
        </SectionWrapper>
      </div>
    </div>
  );
}
