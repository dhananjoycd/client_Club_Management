"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { registrationService } from "@/services/registration.service";

export function MemberRegistrationsManager() {
  const registrationsQuery = useQuery({
    queryKey: queryKeys.registrations.all,
    queryFn: () => registrationService.getRegistrations({ limit: 20 }),
    retry: false,
  });

  if (registrationsQuery.isLoading) {
    return <LoadingState title="Loading registrations" description="Fetching your account registration records." />;
  }

  if (registrationsQuery.isError) {
    return <EmptyState title="Unable to load registrations" description={getApiErrorMessage(registrationsQuery.error, "Please verify your account session.")} />;
  }

  const registrations = registrationsQuery.data?.data.result ?? [];

  return (
    <div className="grid gap-6">
      <SectionWrapper title="My registrations" description="Live free and paid event registrations linked to your account.">
        {registrations.length ? (
          registrations.map((registration) => (
            <div
              key={registration.id}
              className="mb-4 flex flex-col gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 last:mb-0 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{registration.event.location}</p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {format(new Date(registration.event.eventDate), "dd MMM yyyy, hh:mm a")}
                </p>
                {registration.event.eventType === "PAID" ? (
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                    Paid event:{" "}
                    {registration.paidAmount
                      ? `${registration.paidAmount} ${registration.paidCurrency?.toUpperCase()}`
                      : `${registration.event.price ?? 0} ${registration.event.currency?.toUpperCase()}`}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={registration.status}
                  variant={registration.status === "REGISTERED" ? "active" : registration.status === "WAITLISTED" ? "pending" : "inactive"}
                  className="w-fit"
                />
                {registration.paymentStatus ? (
                  <StatusBadge
                    label={registration.paymentStatus}
                    variant={registration.paymentStatus === "PAID" || registration.paymentStatus === "NOT_REQUIRED" ? "active" : "pending"}
                    className="w-fit"
                  />
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No registrations yet"
            description="Registered events will appear here once you sign up for an event."
          />
        )}
      </SectionWrapper>
    </div>
  );
}
