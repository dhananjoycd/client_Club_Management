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

export function ApplicationForm() {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
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

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted-foreground)]">
        Applying as <span className="font-semibold text-[var(--color-primary)]">{currentUser.email}</span>
      </div>
      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Department"
            type="text"
            placeholder="Computer Science and Engineering"
            disabled={applicationMutation.isPending}
            error={errors.department}
            {...register("department")}
          />
          <FormField
            label="Session"
            type="text"
            placeholder="2022-23"
            disabled={applicationMutation.isPending}
            error={errors.session}
            {...register("session")}
          />
          <FormField
            label="Student ID"
            type="text"
            placeholder="2022331001"
            disabled={applicationMutation.isPending}
            error={errors.studentId}
            {...register("studentId")}
          />
          <FormField
            label="District"
            type="text"
            placeholder="Enter your district"
            disabled={applicationMutation.isPending}
            error={errors.district}
            {...register("district")}
          />
          <FormField
            label="Phone number"
            type="tel"
            placeholder="01XXXXXXXXX"
            disabled={applicationMutation.isPending}
            error={errors.phone}
            {...register("phone")}
          />
        </div>

        <FormActions
          isSubmitting={applicationMutation.isPending}
          submitLabel="Submit application"
          helperText="Applicant name and email come from your authenticated account on the backend."
        />
      </form>
    </div>
  );
}
