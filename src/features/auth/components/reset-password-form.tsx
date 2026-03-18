"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { PasswordField } from "@/components/forms/password-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { resetPasswordSchema, ResetPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success("Password updated successfully.");
      router.push("/login?reset=1");
    },
    onError: (mutationError) => toast.error(getApiErrorMessage(mutationError, "Password reset failed.")),
  });

  if (error === "INVALID_TOKEN" || !token) {
    return (
      <div className="grid gap-5">
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          This password reset link is invalid or has expired.
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Request a fresh link from the <Link href="/forgot-password" className="font-semibold text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]">forgot password page</Link>.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) => resetPasswordMutation.mutate({ newPassword: values.newPassword, token }))}
      noValidate
    >
      <PasswordField label="New password" placeholder="Enter your new password" autoComplete="new-password" disabled={resetPasswordMutation.isPending} error={errors.newPassword} {...register("newPassword")} />
      <PasswordField label="Confirm new password" placeholder="Re-enter your new password" autoComplete="new-password" disabled={resetPasswordMutation.isPending} error={errors.confirmPassword} {...register("confirmPassword")} />
      <FormActions
        isSubmitting={resetPasswordMutation.isPending}
        submitLabel={resetPasswordMutation.isPending ? "Resetting password..." : "Reset password"}
        helperText="Use at least 8 characters for your new password."
        secondaryAction={<p className="text-sm text-[var(--color-muted-foreground)]">Remembered it? <Link href="/login" className="font-semibold text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]">Back to sign in</Link></p>}
      />
    </form>
  );
}
