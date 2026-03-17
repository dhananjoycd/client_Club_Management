"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { accountService } from "@/services/account.service";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().min(1, "Phone is required."),
  academicSession: z.string().trim().min(1, "Session is required."),
  department: z.string().trim().min(1, "Department is required."),
  bio: z.string().max(500).optional(),
  profilePhoto: z.string().url().or(z.literal("")).optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export function AccountProfileManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectTo = searchParams.get("redirect");
  const profileQuery = useQuery({ queryKey: queryKeys.account.profile, queryFn: accountService.getProfile, retry: false });
  const profile = profileQuery.data?.data;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "", academicSession: "", department: "", bio: "", profilePhoto: "" },
  });

  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        academicSession: profile.academicSession ?? "",
        department: profile.department ?? "",
        bio: profile.memberProfile?.bio ?? "",
        profilePhoto: profile.memberProfile?.profilePhoto ?? "",
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: accountService.updateProfile,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Profile updated successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.account.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.member }),
        queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all }),
      ]);
      if (redirectTo && response.data?.profileComplete) {
        router.push(redirectTo);
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Profile update failed.")),
  });

  if (profileQuery.isLoading) return <LoadingState title="Loading profile" description="Fetching your account from the backend." />;
  if (profileQuery.isError) return <EmptyState title="Unable to load profile" description={getApiErrorMessage(profileQuery.error, "Please verify your session.")} />;
  if (!profile) return <EmptyState title="Profile not found" description="No account was found for the current session." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <SectionWrapper title="My Profile" description="Keep your account details complete so events can auto-fill registration data.">
        {!profile.profileComplete ? (
          <div className="mb-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Missing fields: {profile.missingFields.join(", ")}. Complete these before registering for an event.
          </div>
        ) : (
          <div className="mb-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Your profile is event-ready. Registration forms can now use your saved account data automatically.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {[["Name", profile.name ?? "Not provided"], ["Email", profile.email], ["Phone", profile.phone ?? "Not provided"], ["Session", profile.academicSession ?? "Not provided"], ["Department", profile.department ?? "Not provided"], ["Role", profile.role]].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p>
              <p className="mt-2 break-words text-sm font-semibold leading-6 text-[var(--color-primary)]">{String(value)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Membership</p>
              <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">
                {profile.memberProfile?.membershipId ?? "No membership ID yet"}
              </p>
            </div>
            <StatusBadge
              label={profile.memberProfile?.status ?? "INACTIVE"}
              variant={profile.memberProfile?.status === "ACTIVE" ? "active" : profile.memberProfile?.status ? "inactive" : "pending"}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">
            {profile.memberProfile
              ? "Your membership record is already linked to this account."
              : "This account does not have an approved club membership yet. Apply and wait for admin review to become an active member."}
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper title="Edit profile" description="These fields are used to auto-fill event registrations after login.">
        <form className="grid gap-4" onSubmit={handleSubmit((values) => updateMutation.mutate({
          name: values.name,
          phone: values.phone,
          academicSession: values.academicSession,
          department: values.department,
          bio: values.bio,
          profilePhoto: values.profilePhoto || undefined,
        }))} noValidate>
          <FormField label="Full name" error={errors.name} disabled={updateMutation.isPending} {...register("name")} />
          <FormField label="Email" value={profile.email} disabled />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone" error={errors.phone} disabled={updateMutation.isPending} {...register("phone")} />
            <FormField label="Academic session" error={errors.academicSession} disabled={updateMutation.isPending} {...register("academicSession")} />
          </div>
          <FormField label="Department" error={errors.department} disabled={updateMutation.isPending} {...register("department")} />
          <FormTextarea label="Bio" error={errors.bio as never} disabled={updateMutation.isPending} {...register("bio")} />
          <FormField label="Profile photo URL" error={errors.profilePhoto as never} disabled={updateMutation.isPending} {...register("profilePhoto")} />
          <FormActions isSubmitting={updateMutation.isPending} submitLabel="Save profile" helperText="Name, email, phone, session, and department are used automatically for event registration." />
        </form>
      </SectionWrapper>

      <SectionWrapper className="xl:col-span-2" title="My registrations" description="Free and paid event registrations linked to your account.">
        {profile.registrations.length ? (
          <div className="grid gap-4">
            {profile.registrations.map((registration) => (
              <div key={registration.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-primary)]">{registration.event.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{registration.event.location}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), "dd MMM yyyy, hh:mm a")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={registration.status} variant={registration.status === "REGISTERED" ? "active" : registration.status === "WAITLISTED" ? "pending" : "inactive"} />
                    {registration.paymentStatus ? <StatusBadge label={registration.paymentStatus} variant={registration.paymentStatus === "PAID" || registration.paymentStatus === "NOT_REQUIRED" ? "active" : registration.paymentStatus === "FAILED" ? "inactive" : "pending"} /> : null}
                    {registration.paymentVerificationStatus && registration.paymentVerificationStatus !== "NOT_APPLICABLE" ? <StatusBadge label={registration.paymentVerificationStatus} variant={registration.paymentVerificationStatus === "VERIFIED" ? "active" : registration.paymentVerificationStatus === "FAILED" ? "inactive" : "pending"} /> : null}
                  </div>
                </div>
                {registration.event.eventType === "PAID" ? <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Paid event: {registration.paidAmount ? `${registration.paidAmount} ${"BDT"}` : `${registration.event.price ?? 0} ${"BDT"}`}</p> : null}
              </div>
            ))}
          </div>
        ) : <EmptyState title="No registrations yet" description="Registered events will appear here once you join one." />}
        <div className="mt-5 flex justify-end">
          <Link href="/account/registrations" className="secondary-button h-11 px-5 text-sm">Open registrations page</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
