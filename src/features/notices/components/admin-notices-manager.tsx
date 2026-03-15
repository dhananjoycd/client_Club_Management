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
import { noticeSchema, NoticeSchema } from "@/schemas/notice.schema";
import { noticeService } from "@/services/notice.service";

export function AdminNoticesManager() {
  const queryClient = useQueryClient();
  const noticesQuery = useQuery({ queryKey: queryKeys.notices.admin, queryFn: () => noticeService.getNotices({ limit: 20 }), retry: false });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NoticeSchema>({ resolver: zodResolver(noticeSchema), defaultValues: { title: "", content: "", audience: "ALL" } });
  const notices = noticesQuery.data?.data.result ?? [];
  const selectedNotice = notices[0];

  const createMutation = useMutation({ mutationFn: noticeService.createNotice, onSuccess: async (response) => { toast.success(response.message ?? "Notice created successfully."); reset(); await queryClient.invalidateQueries({ queryKey: queryKeys.notices.all }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Notice creation failed.")) });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<NoticeSchema> }) => noticeService.updateNotice(id, payload), onSuccess: async (response) => { toast.success(response.message ?? "Notice updated successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.notices.all }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Notice update failed.")) });
  const deleteMutation = useMutation({ mutationFn: noticeService.deleteNotice, onSuccess: async (response) => { toast.success(response.message ?? "Notice deleted successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.notices.all }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Notice deletion failed.")) });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionWrapper title="Notice management" description="Live notice records from the backend notice module.">
        {noticesQuery.isLoading ? <LoadingState title="Loading notices" description="Fetching notice records." /> : noticesQuery.isError ? <EmptyState title="Unable to load notices" description={getApiErrorMessage(noticesQuery.error, "Please verify your admin session.")} /> : (
          <div className="grid gap-4">
            {notices.map((notice, index) => (
              <div key={notice.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[var(--color-primary)]">{notice.title}</h3>
                  <div className="flex items-center gap-3"><StatusBadge label={index === 0 ? `Selected ${notice.audience}` : notice.audience} variant={index === 0 ? "active" : "info"} className="w-fit" /><button type="button" onClick={() => deleteMutation.mutate(notice.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Delete</button></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{notice.content}</p>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
      <div className="grid gap-6">
        <SectionWrapper title="Create notice" description="Schema-driven notice publishing form wired to the backend.">
          <form className="grid gap-4" onSubmit={handleSubmit((values) => createMutation.mutate(values))} noValidate>
            <FormField label="Title" error={errors.title} disabled={createMutation.isPending} {...register("title")} />
            <FormTextarea label="Content" error={errors.content as never} disabled={createMutation.isPending} {...register("content")} />
            <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary)]">Audience</span><select className="h-11 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm" disabled={createMutation.isPending} {...register("audience")}><option value="ALL">All</option><option value="MEMBERS">Members</option><option value="ADMINS">Admins</option></select></label>
            <FormActions isSubmitting={createMutation.isPending} submitLabel="Create notice" helperText="New notices are published directly to the backend notice module." />
          </form>
        </SectionWrapper>
        <SectionWrapper title="Quick update selected notice" description="Fast update action for the first loaded notice record.">
          {selectedNotice ? (
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4"><p className="text-sm font-medium text-[var(--color-muted-foreground)]">Selected notice</p><p className="mt-2 text-lg font-semibold text-[var(--color-primary)]">{selectedNotice.title}</p></div>
              <button type="button" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: selectedNotice.id, payload: { title: `${selectedNotice.title} (Updated)` } })} className="h-11 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary)] disabled:opacity-50">Append Updated to title</button>
            </div>
          ) : <EmptyState title="No notice selected" description="Create a notice or load existing notice data to use quick updates." />}
        </SectionWrapper>
      </div>
    </div>
  );
}
