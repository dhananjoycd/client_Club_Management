"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { RegistrationFilterBar } from "@/components/shared/registration-filter-bar";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { RegistrationFilter, getPaymentStatusLabel, getPaymentVerificationStatusLabel, getRegistrationStatusLabel, matchesRegistrationFilter } from "@/lib/registration-display";
import { queryKeys } from "@/lib/query-keys";
import { registrationService } from "@/services/registration.service";

export function MemberRegistrationsManager() {
  const [activeFilter, setActiveFilter] = useState<RegistrationFilter>("ALL");

  const registrationsQuery = useQuery({
    queryKey: queryKeys.registrations.all,
    queryFn: () => registrationService.getRegistrations({ limit: 20 }),
    retry: false,
  });

  if (registrationsQuery.isLoading) {
    return <LoadingState title="Loading your registrations" description="Preparing the events you joined through XYZ Tech Club." />;
  }

  if (registrationsQuery.isError) {
    return <EmptyState title="Unable to load registrations" description={getApiErrorMessage(registrationsQuery.error, "Please verify your account session.")} />;
  }

  const registrations = registrationsQuery.data?.data.result ?? [];
  const filteredRegistrations = registrations.filter((registration) => matchesRegistrationFilter(registration, activeFilter));

  return (
    <div className="grid gap-6">
      <SectionWrapper title="My registrations" description="Live free and paid event registrations linked to your account.">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-muted-foreground)]">Filter the registrations you want to review.</p>
          <RegistrationFilterBar value={activeFilter} onChange={setActiveFilter} />
        </div>
        {filteredRegistrations.length ? (
          filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="mb-4 flex flex-col gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 last:mb-0 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
                <p className="mt-2 break-words text-sm text-[var(--color-muted-foreground)]">{registration.event.location}</p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {format(new Date(registration.event.eventDate), "dd MMM yyyy, hh:mm a")}
                </p>
                {registration.event.eventType === "PAID" ? (
                  <p className="mt-2 break-words text-sm text-[var(--color-muted-foreground)]">
                    Paid event:{" "}
                    {registration.paidAmount
                      ? `${registration.paidAmount} ${"BDT"}`
                      : `${registration.event.price ?? 0} ${"BDT"}`}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={getRegistrationStatusLabel(registration.status)}
                  variant={registration.status === "REGISTERED" ? "active" : registration.status === "WAITLISTED" ? "pending" : "inactive"}
                  className="w-fit"
                />
                {getPaymentStatusLabel(registration.paymentStatus) ? (
                  <StatusBadge
                    label={getPaymentStatusLabel(registration.paymentStatus) as string}
                    variant={registration.paymentStatus === "PAID" || registration.paymentStatus === "NOT_REQUIRED" ? "active" : registration.paymentStatus === "FAILED" ? "inactive" : "pending"}
                    className="w-fit"
                  />
                ) : null}
                {getPaymentVerificationStatusLabel(registration.paymentVerificationStatus) ? (
                  <StatusBadge
                    label={getPaymentVerificationStatusLabel(registration.paymentVerificationStatus) as string}
                    variant={registration.paymentVerificationStatus === "VERIFIED" ? "active" : registration.paymentVerificationStatus === "FAILED" ? "inactive" : "pending"}
                    className="w-fit"
                  />
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No registrations yet"
            description={activeFilter === "ALL" ? "Registered events will appear here once you sign up for an event." : "No registrations match the selected filter yet."}
          />
        )}
      </SectionWrapper>
    </div>
  );
}
