"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { applicationService } from "@/services/application.service";
import { authService } from "@/services/auth.service";
import { accountService } from "@/services/account.service";

const restrictedRoleConfig: Record<string, { title: string; description: string; href: string; actionLabel: string }> = {
  MEMBER: {
    title: "You are already a member",
    description: "Your account is already approved as a club member, so you do not need to submit another membership application.",
    href: "/account",
    actionLabel: "Go to account dashboard",
  },
  ADMIN: {
    title: "You already have admin access",
    description: "Your account already has administrative access, so the membership application form is not relevant for this role.",
    href: "/admin",
    actionLabel: "Go to admin dashboard",
  },
  SUPER_ADMIN: {
    title: "You already have super admin access",
    description: "Your account already has super admin access, so the membership application form is not relevant for this role.",
    href: "/admin",
    actionLabel: "Go to admin dashboard",
  },
  EVENT_MANAGER: {
    title: "You already have event manager access",
    description: "Your account already has event management access, so the membership application form is not relevant for this role.",
    href: "/admin",
    actionLabel: "Go to event dashboard",
  },
};

const applicationStatusConfig: Record<string, { title: string; description: string; tone: string; href?: string; actionLabel?: string }> = {
  PENDING: {
    title: "Application under review",
    description: "You have already submitted your membership application. Please wait while the admin team reviews it.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    href: "/account/membership-status",
    actionLabel: "View membership status",
  },
  APPROVED: {
    title: "Application approved",
    description: "Your membership has already been approved. You do not need to submit another application.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    href: "/account",
    actionLabel: "Go to account dashboard",
  },
  REJECTED: {
    title: "Previous application was rejected",
    description: "You can update your academic and contact details below and submit the application again.",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function ApplicationForm() {
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });
  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.list("me"),
    queryFn: () => applicationService.getApplications({ limit: 10 }),
    enabled: Boolean(sessionQuery.data?.data?.user),
  });


  const applicationMutation = useMutation({
    mutationFn: applicationService.submitApplication,
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.account.profile }),
      ]);
      toast.success(response.message ?? "Application submitted successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Application submission failed. Please try again."));
    },
  });


  const currentUser = sessionQuery.data?.data?.user;
  const profileQuery = useQuery({
    queryKey: queryKeys.account.profile,
    queryFn: accountService.getProfile,
    enabled: Boolean(currentUser),
    retry: false,
  });
  const restrictedRoleState = currentUser ? restrictedRoleConfig[currentUser.role] : null;
  const latestApplication = applicationsQuery.data?.data?.result?.[0];
  const latestApplicationState = latestApplication ? applicationStatusConfig[latestApplication.status] : null;
  const profile = profileQuery.data?.data;
  const membershipMissingFields = [
    !profile?.name?.trim() ? "name" : null,
    !profile?.phone?.trim() ? "phone" : null,
    !profile?.academicSession?.trim() ? "session" : null,
    !profile?.department?.trim() ? "department" : null,
    !profile?.studentId?.trim() ? "student ID" : null,
  ].filter(Boolean) as string[];
  const canShowForm = !restrictedRoleState && currentUser && profile && membershipMissingFields.length === 0 && latestApplication?.status !== "PENDING" && latestApplication?.status !== "APPROVED";

  if (restrictedRoleState) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="text-lg font-semibold text-emerald-800">{restrictedRoleState.title}</h3>
        <p className="mt-3 text-sm leading-6 text-emerald-700">{restrictedRoleState.description}</p>
        <div className="mt-5">
          <Link href={restrictedRoleState.href} className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white">
            {restrictedRoleState.actionLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">Sign in required</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
          The backend only accepts membership applications from authenticated users. Sign in first, then return to complete your application.
        </p>
        <div className="mt-5">
          <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (applicationsQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 text-sm text-[var(--color-muted-foreground)]">
        Checking your latest membership application status...
      </div>
    );
  }

  if (applicationsQuery.isError || profileQuery.isError) {
    return (
      <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        Could not load your profile or application status right now. Please refresh and try again.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {latestApplicationState ? (
        <div className={`rounded-[1.5rem] border p-5 ${latestApplicationState.tone}`}>
          <h3 className="text-lg font-semibold">{latestApplicationState.title}</h3>
          <p className="mt-3 text-sm leading-6">{latestApplicationState.description}</p>
          {latestApplicationState.href && latestApplicationState.actionLabel ? (
            <div className="mt-5">
              <Link href={latestApplicationState.href} className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/90 px-5 text-sm font-semibold text-current shadow-sm ring-1 ring-black/5">
                {latestApplicationState.actionLabel}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {!profile && currentUser ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Could not load your account profile. Please refresh and try again.
        </div>
      ) : null}

      {profile && membershipMissingFields.length > 0 && latestApplication?.status !== "PENDING" && latestApplication?.status !== "APPROVED" ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-lg font-semibold text-amber-800">Complete your profile first</h3>
          <p className="mt-3 text-sm leading-6 text-amber-700">Membership applications now use your account profile automatically. Complete these fields first: {membershipMissingFields.join(", ")}.</p>
          <div className="mt-5">
            <Link href="/account/profile" className="inline-flex h-11 items-center justify-center rounded-2xl bg-amber-600 px-5 text-sm font-semibold text-white">
              Go to profile
            </Link>
          </div>
        </div>
      ) : null}

      {canShowForm ? (
        <>
          <WarningConfirmModal
            open={isConfirmOpen}
            title="Confirm your membership data"
            description="Please review your full name, phone, academic session, department, and student ID carefully. After submission, these membership fields will stay locked while your application is under review."
            confirmLabel={latestApplication?.status === "REJECTED" ? "Resubmit Application" : "Submit Application"}
            isLoading={applicationMutation.isPending}
            onCancel={() => setIsConfirmOpen(false)}
            onConfirm={async () => {
              if (!profile) return;
              await applicationMutation.mutateAsync({
                department: profile.department ?? "",
                session: profile.academicSession ?? "",
                studentId: profile.studentId ?? "",
                district: profile.district ?? undefined,
                phone: profile.phone ?? "",
              });
              setIsConfirmOpen(false);
            }}
          />
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 text-sm text-[var(--color-muted-foreground)]">
            <p>Applying as <span className="font-semibold text-[var(--color-primary)]">{currentUser.email}</span></p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["Full name", profile.name ?? "Not provided"],
                ["Phone", profile.phone ?? "Not provided"],
                ["Academic session", profile.academicSession ?? "Not provided"],
                ["Department", profile.department ?? "Not provided"],
                ["Student ID", profile.studentId ?? "Not provided"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.25rem] app-card-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setIsConfirmOpen(true);
            }}
            noValidate
          >
            <FormActions isSubmitting={applicationMutation.isPending} submitLabel={latestApplication?.status === "REJECTED" ? "Resubmit application" : "Submit application"} helperText="Membership applications now pull phone, session, department, and student ID directly from your profile." />
          </form>
        </>
      ) : null}
    </div>
  );
}

