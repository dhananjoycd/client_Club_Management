"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { queryKeys } from "@/lib/query-keys";
import { contactService } from "@/services/contact.service";
import { contactCategoryLabels, contactCategoryOptions, contactStatusLabels, contactStatusOptions, ContactMessageCategory, ContactMessageItem, ContactMessageStatus } from "@/types/contact.types";

type PendingQuickAction = {
  item: ContactMessageItem;
  status: ContactMessageStatus;
  title: string;
  description: string;
  confirmLabel: string;
};

const CONTACTS_PER_PAGE = 8;
const statusFilterOptions: Array<{ value: ContactMessageStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  ...contactStatusOptions,
];

const statusVariant = (status: ContactMessageStatus) => status === "RESOLVED" ? "active" as const : status === "IN_PROGRESS" ? "pending" as const : "inactive" as const;

export function AdminContactsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ContactMessageCategory | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessageItem | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [reviewStatus, setReviewStatus] = useState<ContactMessageStatus>("PENDING");
  const [pendingQuickAction, setPendingQuickAction] = useState<PendingQuickAction | null>(null);
  const [pendingQuickNote, setPendingQuickNote] = useState("");

  const contactsQuery = useQuery({
    queryKey: queryKeys.contacts.adminList(`page-${page}-status-${statusFilter}-category-${categoryFilter}-search-${searchTerm}`),
    queryFn: () => contactService.getAdminMessages({
      page,
      limit: CONTACTS_PER_PAGE,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      category: categoryFilter === "ALL" ? undefined : categoryFilter,
      searchTerm: searchTerm || undefined,
    }),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: ContactMessageStatus; adminNote?: string } }) => contactService.reviewMessage(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Contact request updated successfully.");
      const updated = response.data;
      setSelected(updated);
      setAdminNote(updated.adminNote ?? "");
      setReviewStatus(updated.status);
      setPendingQuickAction(null);
      setPendingQuickNote("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Contact request update failed.")),
  });

  const data = contactsQuery.data?.data;
  const totalPages = data?.meta ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  useEffect(() => {
    setPage(1);
    setSelected(null);
    setAdminNote("");
    setReviewStatus("PENDING");
  }, [searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    if (!selected) return;
    const latest = data?.result.find((item) => item.id === selected.id);
    if (latest) {
      setSelected(latest);
      setAdminNote(latest.adminNote ?? "");
      setReviewStatus(latest.status);
    }
  }, [data?.result, selected]);

  const openDetails = (item: ContactMessageItem) => {
    setSelected(item);
    setAdminNote(item.adminNote ?? "");
    setReviewStatus(item.status);
  };

  const openQuickAction = (item: ContactMessageItem, status: ContactMessageStatus) => {
    setPendingQuickAction({
      item,
      status,
      title: status === "RESOLVED" ? "Resolve this message?" : status === "IN_PROGRESS" ? "Move this message to in progress?" : "Move this message back to pending?",
      description: status === "RESOLVED"
        ? "The sender will see this request as resolved after you confirm."
        : status === "IN_PROGRESS"
          ? "Use this when the admin team has started reviewing or handling the request."
          : "This will reopen the request as pending so it can be reviewed again.",
      confirmLabel: status === "RESOLVED" ? "Confirm resolve" : status === "IN_PROGRESS" ? "Confirm progress" : "Confirm pending",
    });
    setPendingQuickNote(item.adminNote || (status === "RESOLVED" ? "Your message has been reviewed by the admin team." : status === "IN_PROGRESS" ? "The admin team is reviewing your message." : ""));
  };

  const confirmQuickAction = () => {
    if (!pendingQuickAction) return;
    reviewMutation.mutate({
      id: pendingQuickAction.item.id,
      payload: {
        status: pendingQuickAction.status,
        adminNote: pendingQuickNote || undefined,
      },
    });
  };

  if (!contactsQuery.data && contactsQuery.isLoading) {
    return <TableLoadingState title="Loading contacts" description="Preparing the admin contact inbox and the latest user requests." />;
  }

  if (contactsQuery.isError) {
    return <EmptyState title="Unable to load contact inbox" description={getApiErrorMessage(contactsQuery.error, "Please verify your admin session.")} />;
  }

  return (
    <>
      <SectionWrapper title="Contact inbox" description="Review user messages sent from the public contact page and keep the status updated from one dashboard panel.">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4"><p className="text-sm text-[var(--color-muted-foreground)]">Total</p><p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{data?.summary.total ?? 0}</p></div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-amber-800">Pending</p><p className="mt-2 text-3xl font-semibold text-amber-900">{data?.summary.pending ?? 0}</p></div>
            <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4"><p className="text-sm text-sky-800">In Progress</p><p className="mt-2 text-3xl font-semibold text-sky-900">{data?.summary.inProgress ?? 0}</p></div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm text-emerald-800">Resolved</p><p className="mt-2 text-3xl font-semibold text-emerald-900">{data?.summary.resolved ?? 0}</p></div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search messages</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by sender, email, subject, or message" className="input-base h-12 w-full pl-11 pr-4 text-sm" />
                </div>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Category</span>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ContactMessageCategory | "ALL")} className="input-base h-12 px-4 text-sm">
                  <option value="ALL">All categories</option>
                  {contactCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilterOptions.map((option) => (
                <FilterChip key={option.value} label={option.label} active={statusFilter === option.value} onClick={() => setStatusFilter(option.value)} />
              ))}
            </div>
          </div>

          {data?.result.length ? (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {data.result.map((item) => (
                  <article key={item.id} className="rounded-[1.5rem] app-card-subtle p-5 transition hover:border-[var(--color-accent)] hover:bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[var(--color-primary)]">{item.subject}</p>
                        <div className="mt-2 flex flex-wrap gap-2"><span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-3 py-1 text-xs font-medium text-[var(--color-primary-strong)]">{item.senderName}</span><span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)]">{item.senderEmail}</span></div>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{contactCategoryLabels[item.category]}</p>
                      </div>
                      <StatusBadge label={contactStatusLabels[item.status]} variant={statusVariant(item.status)} />
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
                      <p className="line-clamp-3 text-sm leading-7 text-[var(--color-foreground)]">{item.message}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[var(--color-muted-foreground)]">Sent {new Date(item.createdAt).toLocaleDateString("en-GB")}</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openDetails(item)} className="secondary-button h-10 px-4 text-sm">Details</button>
                        {item.status === "PENDING" ? (
                          <>
                            <button type="button" onClick={() => openQuickAction(item, "IN_PROGRESS")} disabled={reviewMutation.isPending} className="secondary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Mark in progress</button>
                            <button type="button" onClick={() => openQuickAction(item, "RESOLVED")} disabled={reviewMutation.isPending} className="primary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Resolve</button>
                          </>
                        ) : item.status === "IN_PROGRESS" ? (
                          <>
                            <button type="button" onClick={() => openQuickAction(item, "PENDING")} disabled={reviewMutation.isPending} className="secondary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Move to pending</button>
                            <button type="button" onClick={() => openQuickAction(item, "RESOLVED")} disabled={reviewMutation.isPending} className="primary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Resolve</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => openQuickAction(item, "IN_PROGRESS")} disabled={reviewMutation.isPending} className="secondary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">Reopen</button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No messages found" description="No contact message matches the current search or filters." />
          )}
        </div>
      </SectionWrapper>

      {selected ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/45 px-4 py-6" role="dialog" aria-modal="true">
          <div className="mx-auto my-auto max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 shadow-[0_28px_70px_rgba(8,22,49,0.24)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Contact details</p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--color-primary-strong)]">{selected.subject}</h2>
                <div className="mt-3 flex flex-wrap gap-2"><span className="inline-flex rounded-full app-card-subtle px-3 py-1 text-xs font-medium text-[var(--color-primary-strong)]">{selected.senderName}</span><span className="inline-flex rounded-full app-card-subtle px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)]">{selected.senderEmail}</span></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={contactStatusLabels[selected.status]} variant={statusVariant(selected.status)} />
                <button type="button" onClick={() => setSelected(null)} className="secondary-button h-10 px-4 text-sm">Close</button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Category</p>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-strong)]">{contactCategoryLabels[selected.category]}</p>
              </div>
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Phone</p>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-strong)]">{selected.senderPhone || "Not provided"}</p>
              </div>
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Created</p>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-strong)]">{new Date(selected.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] app-card-subtle p-5">
              <p className="text-sm leading-8 text-[var(--color-foreground)]">{selected.message}</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Current status</p>
                <div className="mt-2">
                  <StatusBadge label={contactStatusLabels[selected.status]} variant={statusVariant(selected.status)} />
                </div>
              </div>
              <div className="rounded-[1.25rem] app-card-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Admin note</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted-foreground)]">{selected.adminNote || "No admin note has been added yet."}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={Boolean(pendingQuickAction)}
        title={pendingQuickAction?.title ?? "Confirm action"}
        description={pendingQuickAction?.description ?? "Review this action before continuing."}
        confirmLabel={pendingQuickAction?.confirmLabel ?? "Confirm"}
        cancelLabel="Cancel"
        isLoading={reviewMutation.isPending}
        onConfirm={confirmQuickAction}
        onCancel={() => {
          setPendingQuickAction(null);
          setPendingQuickNote("");
        }}
      >
        <label className="grid gap-2 text-left">
          <span className="text-sm font-medium text-[var(--color-primary-strong)]">Admin note (optional)</span>
          <textarea value={pendingQuickNote} onChange={(event) => setPendingQuickNote(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Add a short note before confirming this action..." />
        </label>
      </WarningConfirmModal>
    </>
  );
}

