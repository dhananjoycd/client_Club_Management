"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { FormLoadingState } from "@/components/feedback/form-loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { memberService } from "@/services/member.service";
import { z } from "zod";

const profileSchema = z.object({ bio: z.string().max(500).optional(), profilePhoto: z.string().url().or(z.literal("")).optional() });
type ProfileSchema = z.infer<typeof profileSchema>;

export function MemberProfileManager() {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const membersQuery = useQuery({ queryKey: queryKeys.members.me, queryFn: () => memberService.getMembers({ searchTerm: sessionQuery.data?.data?.user?.email, limit: 1 }), enabled: Boolean(sessionQuery.data?.data?.user?.email), retry: false });
  const member = membersQuery.data?.data.result?.[0];
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileSchema>({ resolver: zodResolver(profileSchema), defaultValues: { bio: "", profilePhoto: "" } });

  React.useEffect(() => { if (member) reset({ bio: member.bio ?? "", profilePhoto: member.profilePhoto ?? "" }); }, [member, reset]);

  const updateMutation = useMutation({ mutationFn: (values: ProfileSchema) => memberService.updateMember(member!.id, { bio: values.bio, profilePhoto: values.profilePhoto || undefined }), onSuccess: async (response) => { toast.success(response.message ?? "Profile updated successfully."); await queryClient.invalidateQueries({ queryKey: queryKeys.members.me }); }, onError: (error) => toast.error(getApiErrorMessage(error, "Profile update failed.")) });

  if (sessionQuery.isLoading || membersQuery.isLoading) return <FormLoadingState title="Loading member profile" description="Preparing your approved XYZ Tech Club member profile." />;
  if (sessionQuery.isError || membersQuery.isError) return <EmptyState title="Unable to load profile" description={getApiErrorMessage(sessionQuery.error ?? membersQuery.error, "Please verify your member session.")} />;
  if (!member) return <EmptyState title="Profile not found" description="No member profile record was found for the current account." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionWrapper title="Profile information" description="Live member profile details with editable bio and profile photo fields.">
        <div className="grid gap-4 md:grid-cols-2">
          {[ ["Name", member.user.name ?? "Not provided"], ["Email", member.user.email], ["Membership ID", member.membershipId], ["Status", member.status], ["Joined", new Date(member.joinDate).toLocaleDateString()], ["Role", member.user.role] ].map(([label, value]) => <div key={label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5"><p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p><p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-primary)]">{String(value)}</p></div>)}
        </div>
      </SectionWrapper>
      <SectionWrapper title="Edit profile" description="Update the editable parts of your member profile.">
        <form className="grid gap-4" onSubmit={handleSubmit((values) => updateMutation.mutate(values))} noValidate>
          <FormTextarea label="Bio" error={errors.bio as any} disabled={updateMutation.isPending} {...register("bio")} />
          <FormField label="Profile photo URL" error={errors.profilePhoto as any} disabled={updateMutation.isPending} {...register("profilePhoto")} />
          <div><StatusBadge label={member.status} variant={member.status === "ACTIVE" ? "active" : "inactive"} /></div>
          <FormActions isSubmitting={updateMutation.isPending} submitLabel="Update profile" helperText="Editable profile fields are now connected to the member update API." />
        </form>
      </SectionWrapper>
    </div>
  );
}
