"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { format } from "date-fns";
import { PencilLine, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { noticeAudienceValues, noticeSchema, NoticeSchema } from "@/schemas/notice.schema";
import { noticeService } from "@/services/notice.service";

const audienceLabels: Record<(typeof noticeAudienceValues)[number], string> = {
  ALL: "All signed-in users",
  USERS: "Users",
  APPLICANTS: "Applicants",
  MEMBERS: "Members",
  EVENT_MANAGERS: "Event managers",
  ADMINS: "Admins",
};

const ADMIN_NOTICE_LIMIT = 10;
const formatNoticeDateTime = (value: string) => format(new Date(value), "dd MMM yyyy, hh:mm a");
const isEditedNotice = (createdAt: string, updatedAt: string) =>
  new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 1000;

export function AdminNoticesManager() {
  const queryClient = useQueryClient();
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const noticesQuery = useQuery({
    queryKey: queryKeys.notices.adminList(`page-${page}-search-${searchTerm}`),
    queryFn: () => noticeService.getNotices({ limit: ADMIN_NOTICE_LIMIT, page, searchTerm: searchTerm || undefined }),
    retry: false,
  });

  const createForm = useForm<NoticeSchema>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: "", content: "", audience: "ALL", sendEmail: false },
  });

  const editForm = useForm<NoticeSchema>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: "", content: "", audience: "ALL", sendEmail: false },
  });

  const notices = useMemo(() => noticesQuery.data?.data.result ?? [], [noticesQuery.data]);
  const meta = noticesQuery.data?.data.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;
  const hasSearch = Boolean(searchTerm.trim());
  const editingNotice = useMemo(
    () => notices.find((notice) => notice.id === editingNoticeId) ?? null,
    [notices, editingNoticeId],
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (!editingNotice) {
      editForm.reset({ title: "", content: "", audience: "ALL", sendEmail: false });
      return;
    }

    editForm.reset({
      title: editingNotice.title,
      content: editingNotice.content,
      audience: editingNotice.audience,
      sendEmail: false,
    });
  }, [editingNotice, editForm]);

  const invalidateNoticeQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.admin }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: noticeService.createNotice,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Notice created successfully.");
      await invalidateNoticeQueries();
      createForm.reset({ title: "", content: "", audience: "ALL", sendEmail: false });
      setIsCreateOpen(false);
      setPage(1);
      setSearchTerm("");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Notice creation failed.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NoticeSchema }) => noticeService.updateNotice(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Notice updated successfully.");
      setEditingNoticeId(null);
      await invalidateNoticeQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Notice update failed.")),
  });

  const deleteMutation = useMutation({
    mutationFn: noticeService.deleteNotice,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Notice deleted successfully.");
      setPendingDeleteId(null);
      if (editingNoticeId === pendingDeleteId) {
        setEditingNoticeId(null);
      }
      await invalidateNoticeQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Notice deletion failed.")),
  });

  const isCreating = createMutation.isPending;
  const isEditing = updateMutation.isPending;

  const handleCreateNotice: SubmitHandler<NoticeSchema> = (values) => {
    createMutation.mutate(values);
  };

  const handleEditNotice: SubmitHandler<NoticeSchema> = (values) => {
    if (!editingNotice) return;
    updateMutation.mutate({ id: editingNotice.id, payload: values });
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionWrapper
          title="New notice"
          description="Set up a notice when your team is ready to publish an update."
        >
          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => setIsCreateOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] px-5 py-4 text-left transition hover:border-[var(--color-accent)] hover:bg-white"
              aria-expanded={isCreateOpen}
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Open notice form</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{isCreateOpen ? "Hide the notice form once you are done creating updates." : "Open the notice form to publish a fresh update for the selected audience."}</p>
              </div>
              <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-4 text-base font-semibold text-[var(--color-primary)]">
                {isCreateOpen ? "-" : "+"}
              </span>
            </button>
            {isCreateOpen ? (
              <form className="grid gap-4" onSubmit={createForm.handleSubmit(handleCreateNotice)} noValidate>
                <FormField
                  label="Title"
                  error={createForm.formState.errors.title}
                  disabled={isCreating}
                  {...createForm.register("title")}
                />
                <FormTextarea
                  label="Content"
                  error={createForm.formState.errors.content as never}
                  disabled={isCreating}
                  {...createForm.register("content")}
                />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-primary)]">Audience</span>
                  <select className="input-base h-11 px-4 text-sm" disabled={isCreating} {...createForm.register("audience")}>
                    {noticeAudienceValues.map((value) => (
                      <option key={value} value={value}>
                        {audienceLabels[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                    disabled={isCreating}
                    {...createForm.register("sendEmail")}
                  />
                  <span>
                    <span className="block font-medium text-[var(--color-primary)]">Send this notice by email</span>
                    The selected audience will receive this notice by email too.
                  </span>
                </label>
                <FormActions isSubmitting={isCreating} submitLabel="Create notice" />
              </form>
            ) : null}
          </div>
        </SectionWrapper>

        <SectionWrapper title="All notices" description="Search, paginate, and manage notices from each card.">
          <div className="grid gap-5">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search notices</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <input
                    name="admin-notice-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by title or content"
                    className="input-base h-12 w-full pl-11 pr-4 text-sm"
                  />
                </div>
              </label>
            </div>

            {noticesQuery.isLoading ? (
              <LoadingState title="Loading notice board" description="Preparing the notices your XYZ Tech Club team can manage." />
            ) : noticesQuery.isError ? (
              <EmptyState title="Unable to load notices" description={getApiErrorMessage(noticesQuery.error, "Please verify your admin session.")} />
            ) : !notices.length ? (
              <EmptyState
                title={hasSearch ? "No matching notices" : "No notices yet"}
                description={
                  hasSearch
                    ? "Try a different keyword to find the notice you want to edit."
                    : "Create your first notice to start publishing updates."
                }
              />
            ) : (
              <>
                <div className="grid gap-4">
                  {notices.map((notice) => {
                    const edited = isEditedNotice(notice.createdAt, notice.updatedAt);

                    return (
                      <article
                        key={notice.id}
                        className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 transition hover:border-[var(--color-accent)] hover:bg-white"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-[var(--color-primary)]">{notice.title}</h3>
                            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                              {formatNoticeDateTime(notice.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge label={audienceLabels[notice.audience]} variant="info" className="w-fit" />
                            {edited ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                                <PencilLine className="h-3.5 w-3.5" />
                                Edited
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{notice.content}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                            {edited ? `Last updated ${formatNoticeDateTime(notice.updatedAt)}` : "Not edited yet"}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingNoticeId(notice.id)}
                              className="secondary-button h-10 px-4 text-sm"
                            >
                              <span className="inline-flex items-center gap-2">
                                <PencilLine className="h-4 w-4" />
                                Edit
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(notice.id)}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </SectionWrapper>
      </div>

      {editingNotice ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-2xl rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">Edit notice</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{editingNotice.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
                  Update this notice and optionally resend it by email to the selected audience.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoticeId(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
                aria-label="Close edit modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={editForm.handleSubmit(handleEditNotice)} noValidate>
              <FormField
                label="Title"
                error={editForm.formState.errors.title}
                disabled={isEditing}
                {...editForm.register("title")}
              />
              <FormTextarea
                label="Content"
                error={editForm.formState.errors.content as never}
                disabled={isEditing}
                {...editForm.register("content")}
              />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary)]">Audience</span>
                <select className="input-base h-11 px-4 text-sm" disabled={isEditing} {...editForm.register("audience")}>
                  {noticeAudienceValues.map((value) => (
                    <option key={value} value={value}>
                      {audienceLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                  disabled={isEditing}
                  {...editForm.register("sendEmail")}
                />
                <span>
                  <span className="block font-medium text-[var(--color-primary)]">Send updated notice by email</span>
                  Tick this if you want the edited notice to be delivered again by email.
                </span>
              </label>
              <FormActions
                isSubmitting={isEditing}
                submitLabel="Save changes"
                helperText={`Published ${formatNoticeDateTime(editingNotice.createdAt)}`}
                secondaryAction={
                  <button
                    type="button"
                    onClick={() => setEditingNoticeId(null)}
                    className="secondary-button h-11 px-5 text-sm"
                  >
                    Cancel
                  </button>
                }
              />
            </form>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={Boolean(pendingDeleteId)}
        title="Delete this notice?"
        description="This action will remove the notice from the backend and public/admin lists. This cannot be undone."
        confirmLabel="Delete notice"
        isLoading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            deleteMutation.mutate(pendingDeleteId);
          }
        }}
      />
    </>
  );
}
