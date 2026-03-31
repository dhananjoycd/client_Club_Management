"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { TableLoadingState } from "@/components/feedback/table-loading-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { getPaymentStatusLabel, getPaymentVerificationStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-display";
import { queryKeys } from "@/lib/query-keys";
import { registrationService } from "@/services/registration.service";
import { RegistrationItem } from "@/types/registration.types";

const PAYMENTS_PER_PAGE = 10;
type PaymentFilter = "ALL" | "PENDING_VERIFICATION" | "VERIFIED" | "FAILED";

const badgeVariant = (status?: string | null) => {
  if (status === "VERIFIED" || status === "PAID") return "active" as const;
  if (status === "PENDING" || status === "PENDING_VERIFICATION") return "pending" as const;
  if (status === "FAILED" || status === "REFUNDED") return "inactive" as const;
  return "default" as const;
};

export function AdminPaymentsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>("ALL");
  const [page, setPage] = useState(1);
  const [detailsPayment, setDetailsPayment] = useState<RegistrationItem | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<RegistrationItem | null>(null);

  const registrationsQuery = useQuery({
    queryKey: queryKeys.payments.list(`search-${searchTerm}-filter-${activeFilter}-page-${page}`),
    queryFn: () => registrationService.getRegistrations({ limit: 100 }),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: registrationService.verifyPayment,
    onSuccess: async (response, registrationId) => {
      toast.success(response.message ?? "Payment verified successfully.");
      setVerificationTarget(null);
      setDetailsPayment((current) => (current?.id === registrationId ? response.data : current));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all }),
        registrationsQuery.refetch(),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Payment verification failed.")),
  });

  const paidRegistrations = useMemo(() => {
    const allRegistrations = registrationsQuery.data?.data.result ?? [];
    return allRegistrations.filter((registration) => registration.event.eventType === "PAID");
  }, [registrationsQuery.data]);

  const summary = useMemo(() => ({
    totalPaid: paidRegistrations.length,
    pendingVerification: paidRegistrations.filter((registration) => registration.paymentVerificationStatus === "PENDING_VERIFICATION").length,
    verified: paidRegistrations.filter((registration) => registration.paymentVerificationStatus === "VERIFIED").length,
    failed: paidRegistrations.filter((registration) => registration.paymentVerificationStatus === "FAILED" || registration.paymentStatus === "FAILED").length,
  }), [paidRegistrations]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return paidRegistrations.filter((registration) => {
      const matchesFilter =
        activeFilter === "ALL"
          ? true
          : activeFilter === "FAILED"
            ? registration.paymentVerificationStatus === "FAILED" || registration.paymentStatus === "FAILED"
            : registration.paymentVerificationStatus === activeFilter;

      if (!matchesFilter) return false;

      if (!normalizedSearch) return true;

      return [
        registration.user?.name ?? registration.snapshotName ?? "",
        registration.user?.email ?? registration.snapshotEmail ?? "",
        registration.event.title,
        registration.event.location,
        registration.stripeCheckoutSessionId ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [activeFilter, paidRegistrations, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE));
  const paginatedPayments = filteredPayments.slice((page - 1) * PAYMENTS_PER_PAGE, page * PAYMENTS_PER_PAGE);

  if (!registrationsQuery.data && registrationsQuery.isLoading) {
    return <TableLoadingState title="Loading payments" description="Preparing paid event registrations and verification states for review." />;
  }

  if (registrationsQuery.isError) {
    return <EmptyState title="Unable to load payments" description={getApiErrorMessage(registrationsQuery.error, "Please verify your admin session.")} />;
  }

  return (
    <>
      <SectionWrapper title="Payments" description="Monitor paid event registrations, verification states, and payment-related exceptions from one place.">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Total paid</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{summary.totalPaid}</p>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Paid registrations linked to XYZ Tech Club events.</p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Pending verification</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{summary.pendingVerification}</p>
              <p className="mt-2 text-sm text-amber-700">Payments still waiting for webhook confirmation.</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Verified</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">{summary.verified}</p>
              <p className="mt-2 text-sm text-emerald-700">Payments fully confirmed and matched to registrations.</p>
            </div>
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-800">Failed</p>
              <p className="mt-2 text-3xl font-semibold text-rose-900">{summary.failed}</p>
              <p className="mt-2 text-sm text-rose-700">Payments that need support or a second review.</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search payments</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by user, email, event, location, or payment reference"
                    className="input-base h-12 w-full pl-11 pr-4 text-sm"
                  />
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  ["ALL", "All"],
                  ["PENDING_VERIFICATION", "Pending Verification"],
                  ["VERIFIED", "Verified"],
                  ["FAILED", "Failed"],
                ] as const).map(([value, label]) => (
                  <FilterChip key={value} label={label} active={activeFilter === value} onClick={() => setActiveFilter(value)} />
                ))}
              </div>
            </div>
          </div>

          {registrationsQuery.isFetching ? (
            <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              Updating payment results based on the latest search and filters...
            </div>
          ) : null}

          {paginatedPayments.length ? (
            <>
              <div className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/80 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                      <tr>
                        <th className="px-5 py-4 font-semibold">User</th>
                        <th className="px-5 py-4 font-semibold">Event</th>
                        <th className="px-5 py-4 font-semibold">Amount</th>
                        <th className="px-5 py-4 font-semibold">Payment</th>
                        <th className="px-5 py-4 font-semibold">Verification</th>
                        <th className="px-5 py-4 font-semibold">Date</th>
                        <th className="px-5 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPayments.map((registration) => (
                        <tr key={registration.id} className="border-t border-[var(--color-border)] align-top">
                          <td className="px-5 py-4">
                            <div className="min-w-[210px]">
                              <p className="font-semibold text-[var(--color-primary)]">{registration.user?.name ?? registration.snapshotName ?? "Unknown user"}</p>
                              <p className="mt-1 text-[var(--color-muted-foreground)]">{registration.user?.email ?? registration.snapshotEmail ?? "No email"}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="min-w-[220px]">
                              <p className="font-semibold text-[var(--color-primary)]">{registration.event.title}</p>
                              <p className="mt-1 text-[var(--color-muted-foreground)]">{registration.event.location}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-[var(--color-primary)]">{registration.paidAmount ?? registration.event.price ?? 0} BDT</td>
                          <td className="px-5 py-4">
                            <StatusBadge label={getPaymentStatusLabel(registration.paymentStatus) ?? "Needs Review"} variant={badgeVariant(registration.paymentStatus)} />
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge label={getPaymentVerificationStatusLabel(registration.paymentVerificationStatus) ?? "Needs Review"} variant={badgeVariant(registration.paymentVerificationStatus)} />
                          </td>
                          <td className="px-5 py-4 text-[var(--color-muted-foreground)]">{format(new Date(registration.registeredAt), "dd MMM yyyy")}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => setDetailsPayment(registration)} className="secondary-button h-10 px-4 text-sm">
                                Details
                              </button>
                              {registration.paymentVerificationStatus === "PENDING_VERIFICATION" ? (
                                <button
                                  type="button"
                                  onClick={() => setVerificationTarget(registration)}
                                  disabled={verifyPaymentMutation.isPending}
                                  className="primary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Verify 
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No payment records found" description="Paid event registrations will appear here once users start completing payments." />
          )}
        </div>
      </SectionWrapper>

      {detailsPayment ? (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center">
            <div className="surface-card w-full max-w-4xl rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Payment details</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{detailsPayment.event.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{detailsPayment.user?.name ?? detailsPayment.snapshotName ?? "Unknown user"} ? {detailsPayment.user?.email ?? detailsPayment.snapshotEmail ?? "No email"}</p>
                </div>
                <button type="button" onClick={() => setDetailsPayment(null)} className="secondary-button h-11 px-5 text-sm">Close</button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                  <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Amount</p>
                  <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{detailsPayment.paidAmount ?? detailsPayment.event.price ?? 0} BDT</p>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                  <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Payment</p>
                  <div className="mt-3"><StatusBadge label={getPaymentStatusLabel(detailsPayment.paymentStatus) ?? "Needs Review"} variant={badgeVariant(detailsPayment.paymentStatus)} /></div>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                  <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Verification</p>
                  <div className="mt-3"><StatusBadge label={getPaymentVerificationStatusLabel(detailsPayment.paymentVerificationStatus) ?? "Needs Review"} variant={badgeVariant(detailsPayment.paymentVerificationStatus)} /></div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Registration snapshot</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Registration", getRegistrationStatusLabel(detailsPayment.status)],
                      ["Registered at", format(new Date(detailsPayment.registeredAt), "dd MMM yyyy, hh:mm a")],
                      ["Phone", detailsPayment.snapshotPhone ?? "Not provided"],
                      ["Session", detailsPayment.snapshotSession ?? "Not provided"],
                      ["Department", detailsPayment.snapshotDepartment ?? "Not provided"],
                      ["Checkout reference", detailsPayment.stripeCheckoutSessionId ?? "Not available"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
                        <p className="mt-2 break-words text-sm font-semibold text-[var(--color-primary)]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Event snapshot</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Event", detailsPayment.event.title],
                      ["Location", detailsPayment.event.location],
                      ["Event date", format(new Date(detailsPayment.event.eventDate), "dd MMM yyyy, hh:mm a")],
                      ["Type", detailsPayment.event.eventType ?? "PAID"],
                      ["Listed price", `${detailsPayment.event.price ?? 0} BDT`],
                      ["Currency", (detailsPayment.paidCurrency ?? detailsPayment.event.currency ?? "BDT").toUpperCase()],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
                        <p className="mt-2 break-words text-sm font-semibold text-[var(--color-primary)]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={Boolean(verificationTarget)}
        title="Verify this payment now?"
        description="Use this only when Stripe already shows the checkout session as paid but the webhook has not marked the registration verified yet. Webhook-verified payments will not show this action."
        confirmLabel="Verify payment"
        cancelLabel="Keep pending"
        isLoading={verifyPaymentMutation.isPending}
        onConfirm={() => {
          if (!verificationTarget) return;
          verifyPaymentMutation.mutate(verificationTarget.id);
        }}
        onCancel={() => {
          if (verifyPaymentMutation.isPending) return;
          setVerificationTarget(null);
        }}
      >
        {verificationTarget ? (
          <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted-foreground)]">
            <p><span className="font-semibold text-[var(--color-primary)]">Event:</span> {verificationTarget.event.title}</p>
            <p className="mt-2"><span className="font-semibold text-[var(--color-primary)]">User:</span> {verificationTarget.user?.email ?? verificationTarget.snapshotEmail ?? "No email"}</p>
            <p className="mt-2 break-all"><span className="font-semibold text-[var(--color-primary)]">Checkout:</span> {verificationTarget.stripeCheckoutSessionId ?? "Not available"}</p>
          </div>
        ) : null}
      </WarningConfirmModal>
    </>
  );
}
