"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { committeeService } from "@/services/committee.service";
import { CommitteeSessionItem } from "@/types/committee.types";

const defaultSessionOptions = Array.from({ length: 11 }, (_, index) => {
  const start = 2026 + index;
  const end = String(start + 1).slice(-2);
  return `${start}-${end}`;
});

const normalizeCommitteeSessionLabel = (value: string) => value.trim().toLowerCase();
const COMMITTEE_SESSIONS_PER_PAGE = 6;

export function AdminCommitteeManager() {
  const queryClient = useQueryClient();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [sessionLabel, setSessionLabel] = useState(defaultSessionOptions[0]);
  const [customSessionLabel, setCustomSessionLabel] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionCoverImageUrl, setSessionCoverImageUrl] = useState("");
  const [editingSession, setEditingSession] = useState<CommitteeSessionItem | null>(null);
  const [editSessionLabel, setEditSessionLabel] = useState("");
  const [editSessionTitle, setEditSessionTitle] = useState("");
  const [editSessionDescription, setEditSessionDescription] = useState("");
  const [editSessionCoverImageUrl, setEditSessionCoverImageUrl] = useState("");
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sessionsQuery = useQuery({ queryKey: queryKeys.committee.adminSessions, queryFn: committeeService.getAdminSessions, retry: false });

  const createSessionMutation = useMutation({
    mutationFn: committeeService.createSession,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session created successfully.");
      setSessionLabel(defaultSessionOptions[0]);
      setCustomSessionLabel("");
      setSessionTitle("");
      setSessionDescription("");
      setSessionCoverImageUrl("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee session creation failed.")),
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof committeeService.updateSession>[1] }) => committeeService.updateSession(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session updated successfully.");
      setEditingSession(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee session update failed.")),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: committeeService.deleteSession,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session deleted successfully.");
      setDeleteSessionId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee session delete failed.")),
  });

  const openEditSessionModal = (session: CommitteeSessionItem) => {
    setEditingSession(session);
    setEditSessionLabel(session.label);
    setEditSessionTitle(session.title ?? "");
    setEditSessionDescription(session.description ?? "");
    setEditSessionCoverImageUrl(session.coverImageUrl ?? "");
  };

  const sessions = sessionsQuery.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(sessions.length / COMMITTEE_SESSIONS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSessions = sessions.slice((safeCurrentPage - 1) * COMMITTEE_SESSIONS_PER_PAGE, safeCurrentPage * COMMITTEE_SESSIONS_PER_PAGE);

  if (sessionsQuery.isLoading) {
    return <LoadingState title="Loading committee sessions" description="Preparing the session-wise committee overview for the admin dashboard." />;
  }

  if (sessionsQuery.isError) {
    return <EmptyState title="Unable to load committee sessions" description="Please verify your super admin session and try again." />;
  }

  return (
    <>
      <div className="grid gap-6 mb-5 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionWrapper title="Create committee session" description="Set up a new committee term like 2026-27 before assigning members.">
          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => setIsCreateSessionOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 px-5 py-4 text-left transition hover:border-[var(--color-accent)] hover:bg-white"
              aria-expanded={isCreateSessionOpen}
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{isCreateSessionOpen ? "Hide session form" : "Open session form"}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{isCreateSessionOpen ? "Collapse this section once the committee term details look right." : "Open the form to create a new committee session for an academic term."}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 text-[var(--color-primary)]">
                <ChevronDown className={`h-5 w-5 transition-transform ${isCreateSessionOpen ? "rotate-180" : "rotate-0"}`} />
              </span>
            </button>

            {isCreateSessionOpen ? (
              <form
                className="grid gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const resolvedSessionLabel = sessionLabel === "CUSTOM" ? customSessionLabel.trim() : sessionLabel;
                  const duplicateSession = sessions.some((session) => normalizeCommitteeSessionLabel(session.label) === normalizeCommitteeSessionLabel(resolvedSessionLabel));

                  if (!resolvedSessionLabel) {
                    toast.error("Enter a valid session label.");
                    return;
                  }

                  if (duplicateSession) {
                    toast.error(`${resolvedSessionLabel} already exists. Choose a different session label.`);
                    return;
                  }

                  createSessionMutation.mutate({
                    label: resolvedSessionLabel,
                    title: sessionTitle || undefined,
                    description: sessionDescription || undefined,
                    coverImageUrl: sessionCoverImageUrl || undefined,
                    isActive: sessions.length === 0,
                  });
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-primary-strong)]">Session label</span>
                  <select value={sessionLabel} onChange={(event) => setSessionLabel(event.target.value)} className="input-base h-12 px-4 text-sm">
                    {defaultSessionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    <option value="CUSTOM">Custom session</option>
                  </select>
                </label>
                {sessionLabel === "CUSTOM" ? (
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--color-primary-strong)]">Custom session</span>
                    <input value={customSessionLabel} onChange={(event) => setCustomSessionLabel(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="2037-38" />
                  </label>
                ) : null}
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Title</span><input value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="Executive Committee 2026-27" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Description</span><textarea value={sessionDescription} onChange={(event) => setSessionDescription(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Optional public description for this committee term." /></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Session cover image URL</span><input value={sessionCoverImageUrl} onChange={(event) => setSessionCoverImageUrl(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="https://example.com/committee-session-cover.jpg" /></label>
                <div className="flex justify-end"><button type="submit" disabled={createSessionMutation.isPending || (sessionLabel === "CUSTOM" && !customSessionLabel.trim())} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{createSessionMutation.isPending ? "Creating..." : "Create session"}</button></div>
              </form>
            ) : null}
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper title="Committee sessions" description="Use this overview board to open a session workspace, switch active terms, or remove old sessions.">
        {sessions.length ? (
          <div className="grid gap-4">
            {paginatedSessions.map((session) => {
              const totalMembers = session.assignments.length;

              return (
                <div key={session.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-[var(--color-primary-strong)]">{session.label}</h2>
                    {session.isActive ? <StatusBadge label="Active" variant="active" /> : <StatusBadge label="Archived" variant="default" />}
                  </div>
                  {session.title ? <p className="mt-2 text-sm font-medium text-[var(--color-primary)]">{session.title}</p> : null}
                  {session.description ? <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{session.description}</p> : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/admin/committee/${session.id}`} className="secondary-button h-10 px-4 text-sm">Open workspace</Link>
                    <button type="button" onClick={() => openEditSessionModal(session)} className="secondary-button h-10 px-4 text-sm">Edit session</button>
                    {!session.isActive ? <button type="button" onClick={() => updateSessionMutation.mutate({ id: session.id, payload: { isActive: true } })} className="primary-button h-10 px-4 text-sm">Set Active</button> : null}
                    <button type="button" onClick={() => setDeleteSessionId(session.id)} className="inline-flex h-10 items-center rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700">Delete session</button>
                  </div>
                  <p className="mt-5 text-sm text-[var(--color-muted-foreground)]">Total members: <span className="font-semibold text-[var(--color-primary)]">{totalMembers}</span></p>
                </div>
              );
            })}
            <PaginationControls currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        ) : <EmptyState title="No committee sessions yet" description="Create the first committee session to start assigning active members." />}
      </SectionWrapper>


      {editingSession ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="surface-card w-full max-w-3xl rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Edit committee session</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{editingSession.label}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Update the session label, public copy, and cover image without leaving the overview page.</p>
              </div>
              <button type="button" onClick={() => setEditingSession(null)} className="secondary-button h-10 px-4 text-sm">Close</button>
            </div>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const resolvedLabel = editSessionLabel.trim();
                const duplicateSession = sessions.some((session) => session.id !== editingSession.id && normalizeCommitteeSessionLabel(session.label) == normalizeCommitteeSessionLabel(resolvedLabel));

                if (!resolvedLabel) {
                  toast.error("Enter a valid session label.");
                  return;
                }

                if (duplicateSession) {
                  toast.error(`${resolvedLabel} already exists. Choose a different session label.`);
                  return;
                }

                updateSessionMutation.mutate({
                  id: editingSession.id,
                  payload: {
                    label: resolvedLabel,
                    title: editSessionTitle || undefined,
                    description: editSessionDescription || undefined,
                    coverImageUrl: editSessionCoverImageUrl.trim(),
                  },
                });
              }}
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Session label</span>
                <input value={editSessionLabel} onChange={(event) => setEditSessionLabel(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="2026-27" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Title</span>
                <input value={editSessionTitle} onChange={(event) => setEditSessionTitle(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="Executive Committee 2026-27" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Description</span>
                <textarea value={editSessionDescription} onChange={(event) => setEditSessionDescription(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Optional public description for this committee term." />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Session cover image URL</span>
                <input value={editSessionCoverImageUrl} onChange={(event) => setEditSessionCoverImageUrl(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="https://example.com/committee-session-cover.jpg" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingSession(null)} className="secondary-button h-11 px-5 text-sm">Cancel</button>
                <button type="submit" disabled={updateSessionMutation.isPending} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{updateSessionMutation.isPending ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={deleteSessionId !== null}
        title="Delete this committee session?"
        description="This will remove the session and every committee assignment inside it. This action cannot be undone."
        confirmLabel="Delete session"
        cancelLabel="Keep session"
        isLoading={deleteSessionMutation.isPending}
        onConfirm={() => {
          if (!deleteSessionId) return;
          deleteSessionMutation.mutate(deleteSessionId);
        }}
        onCancel={() => setDeleteSessionId(null)}
      />
    </>
  );
}
