"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { registrationService } from "@/services/registration.service";

export function MemberRegistrationsManager() {
  const queryClient = useQueryClient();
  const registrationsQuery = useQuery({ queryKey: queryKeys.registrations.all, queryFn: () => registrationService.getRegistrations({ limit: 20 }), retry: false });
  const cancelMutation = useMutation({ mutationFn: registrationService.cancelRegistration, onSuccess: async (response) => { toast.success(response.message ?? "Registration cancelled successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all }); await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.member }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Cancellation failed.")) });

  if (registrationsQuery.isLoading) return <LoadingState title="Loading registrations" description="Fetching your registration records." />;
  if (registrationsQuery.isError) return <EmptyState title="Unable to load registrations" description={getApiErrorMessage(registrationsQuery.error, "Please verify your member session.")} />;

  const registrations = registrationsQuery.data?.data.result ?? [];

  return (
    <div className="grid gap-6">
      <SectionWrapper title="My registrations" description="Live registration records from the backend member workflow.">
        {registrations.length ? registrations.map((registration) => (
          <div key={registration.id} className="mb-4 flex flex-col gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 last:mb-0 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{registration.event.location}</p>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge label={registration.status} variant={registration.status === "REGISTERED" ? "active" : registration.status === "WAITLISTED" ? "pending" : "inactive"} className="w-fit" />
              {registration.status !== "CANCELLED" ? <button type="button" onClick={() => cancelMutation.mutate(registration.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Cancel</button> : null}
            </div>
          </div>
        )) : <EmptyState title="No registrations yet" description="Registered events will appear here once you sign up for an event." />}
      </SectionWrapper>
    </div>
  );
}
