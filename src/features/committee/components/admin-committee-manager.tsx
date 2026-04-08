"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { TableLoadingState } from "@/components/feedback/table-loading-state";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { createCommitteeSessionSchema, CreateCommitteeSessionSchema, editCommitteeSessionSchema, EditCommitteeSessionSchema } from "@/schemas/committee.schema";
import { committeeService } from "@/services/committee.service";
import { CommitteeSessionItem } from "@/types/committee.types";

const defaultSessionOptions = Array.from({ length: 11 }, (_, index) => {
  const start = 2026 + index;
  const end = String(start + 1).slice(-2);
  return `${start}-${end}`;
});

const normalizeCommitteeSessionLabel = (value: string) => value.trim().toLowerCase();
const COMMITTEE_SESSIONS_PER_PAGE = 6;

const createDefaultValues: CreateCommitteeSessionSchema = {
  sessionChoice: defaultSessionOptions[0],
  customSessionLabel: "",
  title: "",
  description: "",
  coverImageUrl: "",
};

const editDefaultValues: EditCommitteeSessionSchema = {
  label: "",
  title: "",
  description: "",
  coverImageUrl: "",
};

export function AdminCommitteeManager() {
  const queryClient = useQueryClient();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<CommitteeSessionItem | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const createForm = useForm<CreateCommitteeSessionSchema>({
    resolver: zodResolver(createCommitteeSessionSchema),
    defaultValues: createDefaultValues,
  });
  const editForm = useForm<EditCommitteeSessionSchema>({
    resolver: zodResolver(editCommitteeSessionSchema),
    defaultValues: editDefaultValues,
  });

  const sessionsQuery = useQuery({ queryKey: queryKeys.committee.adminSessions, queryFn: committeeService.getAdminSessions, retry: false });

  const createSessionMutation = useMutation({
    mutationFn: committeeService.createSession,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session created successfully.");
      createForm.reset(createDefaultValues);
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee session creation failed.")),
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof committeeService.updateSession>[1] }) => committeeService.updateSession(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session updated successfully.");
      setEditingSession(null);
      editForm.reset(editDefaultValues);
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
    editForm.reset({
      label: session.label,
      title: session.title ?? "",
      description: session.description ?? "",
      coverImageUrl: session.coverImageUrl ?? "",
    });
  };

  const closeEditSessionModal = () => {
    setEditingSession(null);
    editForm.reset(editDefaultValues);
  };

  const sessions = sessionsQuery.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(sessions.length / COMMITTEE_SESSIONS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSessions = sessions.slice((safeCurrentPage - 1) * COMMITTEE_SESSIONS_PER_PAGE, safeCurrentPage * COMMITTEE_SESSIONS_PER_PAGE);
  const selectedCreateSession = createForm.watch("sessionChoice");

  if (sessionsQuery.isLoading) {
    return <TableLoadingState title="Loading committee sessions" description="Preparing the session-wise committee overview for the admin dashboard." />;
  }

  if (sessionsQuery.isError) {
    return <EmptyState title="Unable to load committee sessions" description="Please verify your super admin session and try again." />;
  }

  const handleCreateSession = (values: CreateCommitteeSessionSchema) => {
    const resolvedSessionLabel = values.sessionChoice === "CUSTOM" ? (values.customSessionLabel?.trim() || "") : values.sessionChoice;
    const duplicateSession = sessions.some((session) => normalizeCommitteeSessionLabel(session.label) === normalizeCommitteeSessionLabel(resolvedSessionLabel));

    if (duplicateSession) {
      createForm.setError(values.sessionChoice === "CUSTOM" ? "customSessionLabel" : "sessionChoice", {
        message: `${resolvedSessionLabel} already exists. Choose a different session label.`,
      });
      return;
    }

    createSessionMutation.mutate({
      label: resolvedSessionLabel,
      title: values.title?.trim() || undefined,
      description: values.description?.trim() || undefined,
      coverImageUrl: values.coverImageUrl?.trim() || undefined,
      isActive: sessions.length === 0,
    });
  };

  const handleUpdateSession = (values: EditCommitteeSessionSchema) => {
    if (!editingSession) return;

    const resolvedLabel = values.label.trim();
    const duplicateSession = sessions.some((session) => session.id !== editingSession.id && normalizeCommitteeSessionLabel(session.label) === normalizeCommitteeSessionLabel(resolvedLabel));

    if (duplicateSession) {
      editForm.setError("label", {
        message: `${resolvedLabel} already exists. Choose a different session label.`,
      });
      return;
    }

    updateSessionMutation.mutate({
      id: editingSession.id,
      payload: {
        label: resolvedLabel,
        title: values.title?.trim() || undefined,
        description: values.description?.trim() || undefined,
        coverImageUrl: values.coverImageUrl?.trim() || undefined,
      },
    });
  };

  return (
    <>
      <div className="mb-5 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionWrapper title="Create committee session" description="Set up a new committee term like 2026-27 before assigning members.">
          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => setIsCreateSessionOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-strong)]"
              aria-expanded={isCreateSessionOpen}
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{isCreateSessionOpen ? "Hide session form" : "Open session form"}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{isCreateSessionOpen ? "Collapse this section once the committee term details look right." : "Open the form to create a new committee session for an academic term."}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-primary)]">
                <ChevronDown className={`h-5 w-5 transition-transform ${isCreateSessionOpen ? "rotate-180" : "rotate-0"}`} />
              </span>
            </button>

            {isCreateSessionOpen ? (
              <form className="grid gap-4 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" onSubmit={createForm.handleSubmit(handleCreateSession)} noValidate>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-primary-strong)]">Session label</span>
                  <select
                    value={selectedCreateSession}
                    onChange={(event) => createForm.setValue("sessionChoice", event.target.value, { shouldValidate: true, shouldDirty: true })}
                    className={`input-base h-12 px-4 text-sm ${createForm.formState.errors.sessionChoice ? "border-rose-400 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : ""}`}
                    disabled={createSessionMutation.isPending}
                  >
                    {defaultSessionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    <option value="CUSTOM">Custom session</option>
                  </select>
                  {createForm.formState.errors.sessionChoice ? <span className="text-sm text-rose-600">{createForm.formState.errors.sessionChoice.message}</span> : null}
                </label>
                {selectedCreateSession === "CUSTOM" ? (
                  <FormField
                    label="Custom session"
                    placeholder="2037-38"
                    disabled={createSessionMutation.isPending}
                    error={createForm.formState.errors.customSessionLabel as any}
                    {...createForm.register("customSessionLabel")}
                  />
                ) : null}
                <FormField label="Title" placeholder="Executive Committee 2026-27" disabled={createSessionMutation.isPending} error={createForm.formState.errors.title as any} {...createForm.register("title")} />
                <FormTextarea label="Description" rows={4} placeholder="Optional public description for this committee term." disabled={createSessionMutation.isPending} error={createForm.formState.errors.description as any} {...createForm.register("description")} />
                <FormField label="Session cover image URL" placeholder="https://example.com/committee-session-cover.jpg" disabled={createSessionMutation.isPending} error={createForm.formState.errors.coverImageUrl as any} {...createForm.register("coverImageUrl")} />
                <FormActions
                  isSubmitting={createSessionMutation.isPending}
                  submitLabel="Create session"
                  submittingLabel="Creating session..."
                  submittingHint="Saving the committee term and refreshing the overview board."
                  helperText="Use the YYYY-YY format to keep committee terms consistent across the project."
                />
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
                <div key={session.id} className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
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
        <div className="fixed inset-0 z-[110] overflow-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="surface-card mx-auto my-auto w-full max-w-3xl rounded-[var(--radius-panel)] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Edit committee session</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{editingSession.label}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Update the session label, public copy, and cover image without leaving the overview page.</p>
              </div>
              <button type="button" onClick={closeEditSessionModal} className="secondary-button h-10 px-4 text-sm">Close</button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={editForm.handleSubmit(handleUpdateSession)} noValidate>
              <FormField label="Session label" placeholder="2026-27" disabled={updateSessionMutation.isPending} error={editForm.formState.errors.label} {...editForm.register("label")} />
              <FormField label="Title" placeholder="Executive Committee 2026-27" disabled={updateSessionMutation.isPending} error={editForm.formState.errors.title as any} {...editForm.register("title")} />
              <FormTextarea label="Description" rows={4} placeholder="Optional public description for this committee term." disabled={updateSessionMutation.isPending} error={editForm.formState.errors.description as any} {...editForm.register("description")} />
              <FormField label="Session cover image URL" placeholder="https://example.com/committee-session-cover.jpg" disabled={updateSessionMutation.isPending} error={editForm.formState.errors.coverImageUrl as any} {...editForm.register("coverImageUrl")} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditSessionModal} className="secondary-button h-11 px-5 text-sm">Cancel</button>
                <FormActions
                  isSubmitting={updateSessionMutation.isPending}
                  submitLabel="Save changes"
                  submittingLabel="Saving changes..."
                  submittingHint="Updating the committee session and syncing the overview board."
                  className="flex-1"
                />
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

