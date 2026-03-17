"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
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
          {...register("price", { valueAsNumber: true })}
        />
        <FormField label="Currency" value="BDT" disabled readOnly />
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
    return <LoadingState title="Loading event editor" description="Preparing this XYZ Tech Club event for admin editing." />;
  }

  if (eventQuery.isError || !eventQuery.data?.data) {
    return <EmptyState title="Unable to load event" description={getApiErrorMessage(eventQuery.error, "This event could not be loaded for editing.")} />;
  }

  const event = eventQuery.data.data;

  return (
    <SectionWrapper
      title="Edit event"
      description="Update XYZ Tech Club event details, pricing, registration state, and featured visibility from one dedicated editor."
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Now editing</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-primary-strong)]">{event.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Scheduled for {format(new Date(event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
          </div>
          <Link href="/admin/events" className="secondary-button h-11 px-5 text-sm">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to event board
            </span>
          </Link>
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
