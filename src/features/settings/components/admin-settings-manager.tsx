"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { settingsSchema, SettingsSchema } from "@/schemas/settings.schema";
import { settingsService } from "@/services/settings.service";

export function AdminSettingsManager() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsSchema>({ resolver: zodResolver(settingsSchema), defaultValues: { organizationName: "", logoUrl: "", contactEmail: "", phone: "", aboutText: "", facebook: "", linkedin: "" } });

  const saveMutation = useMutation({ mutationFn: settingsService.upsertSettings, onSuccess: async (response) => { toast.success(response.message ?? "Settings saved successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.settings.detail }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Settings update failed.")) });

  React.useEffect(() => {
    const current = settingsQuery.data?.data;
    if (current) {
      const links = (current.socialLinks ?? {}) as Record<string, string>;
      reset({ organizationName: current.organizationName ?? "", logoUrl: current.logoUrl ?? "", contactEmail: current.contactEmail ?? "", phone: current.phone ?? "", aboutText: current.aboutText ?? "", facebook: links.facebook ?? "", linkedin: links.linkedin ?? "" });
    }
  }, [settingsQuery.data, reset]);

  if (settingsQuery.isLoading) return <LoadingState title="Loading settings" description="Fetching site settings from the backend." />;
  if (settingsQuery.isError) return <EmptyState title="Unable to load settings" description={getApiErrorMessage(settingsQuery.error, "Please verify your admin session.")} />;

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => {
        const socialLinks = Object.fromEntries(
          Object.entries({
            facebook: values.facebook?.trim(),
            linkedin: values.linkedin?.trim(),
          }).filter(([, href]) => href),
        );

        saveMutation.mutate({
          organizationName: values.organizationName,
          logoUrl: values.logoUrl || undefined,
          contactEmail: values.contactEmail || undefined,
          phone: values.phone || undefined,
          aboutText: values.aboutText || undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        });
      })}
      noValidate
    >
      <FormField label="Organization name" error={errors.organizationName} disabled={saveMutation.isPending} {...register("organizationName")} />
      <FormField label="Logo URL" error={errors.logoUrl} disabled={saveMutation.isPending} {...register("logoUrl")} />
      <FormField label="Contact email" error={errors.contactEmail} disabled={saveMutation.isPending} {...register("contactEmail")} />
      <FormField label="Phone" error={errors.phone} disabled={saveMutation.isPending} {...register("phone")} />
      <FormField label="Facebook" error={errors.facebook} disabled={saveMutation.isPending} {...register("facebook")} />
      <FormField label="LinkedIn" error={errors.linkedin} disabled={saveMutation.isPending} {...register("linkedin")} />
      <FormTextarea label="About text" error={errors.aboutText} disabled={saveMutation.isPending} {...register("aboutText")} />
      <FormActions isSubmitting={saveMutation.isPending} submitLabel="Save settings" helperText="Settings update uses the backend settings module and admin authorization." />
    </form>
  );
}
