"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField } from "@/components/forms/form-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { applicationSchema } from "@/schemas/application.schema";
import { applicationService } from "@/services/application.service";
import { authService } from "@/services/auth.service";
import { MembershipApplicationPayload } from "@/types/application.types";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MembershipApplicationPayload>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      department: "",
      session: "",
      studentId: "",
      district: "",
      phone: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: applicationService.submitApplication,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      toast.success(response.message ?? "Application submitted successfully.");
      reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Application submission failed. Please try again."));
    },
  });

  const onSubmit = async (values: MembershipApplicationPayload) => {
    await applicationMutation.mutateAsync(values);
  };

  const currentUser = sessionQuery.data?.data?.user;
  const restrictedRoleState = currentUser ? restrictedRoleConfig[currentUser.role] : null;
  const latestApplication = applicationsQuery.data?.data?.result?.[0];
  const latestApplicationState = latestApplication ? applicationStatusConfig[latestApplication.status] : null;
  const canShowForm = !restrictedRoleState && currentUser && latestApplication?.status !== "PENDING" && latestApplication?.status !== "APPROVED";

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

  if (applicationsQuery.isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5 text-sm text-[var(--color-muted-foreground)]">
        Checking your latest membership application status...
      </div>
    );
  }

  if (applicationsQuery.isError) {
    return (
      <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        Could not load your application status right now. Please refresh and try again.
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

      {canShowForm ? (
        <>
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted-foreground)]">
            Applying as <span className="font-semibold text-[var(--color-primary)]">{currentUser.email}</span>
          </div>
          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Department" type="text" placeholder="Computer Science and Engineering" disabled={applicationMutation.isPending} error={errors.department} {...register("department")} />
              <FormField label="Session" type="text" placeholder="2022-23" disabled={applicationMutation.isPending} error={errors.session} {...register("session")} />
              <FormField label="Student ID" type="text" placeholder="2022331001" disabled={applicationMutation.isPending} error={errors.studentId} {...register("studentId")} />
              <FormField label="District" type="text" placeholder="Enter your district" disabled={applicationMutation.isPending} error={errors.district} {...register("district")} />
              <FormField label="Phone number" type="tel" placeholder="01XXXXXXXXX" disabled={applicationMutation.isPending} error={errors.phone} {...register("phone")} />
            </div>

            <FormActions isSubmitting={applicationMutation.isPending} submitLabel={latestApplication?.status === "REJECTED" ? "Resubmit application" : "Submit application"} helperText="Applicant name and email come from your authenticated account on the backend." />
          </form>
        </>
      ) : null}
    </div>
  );
}
