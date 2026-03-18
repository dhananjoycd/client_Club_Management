"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField } from "@/components/forms/form-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: (response) => {
      toast.success(response.message ?? "If this email exists, a reset link has been sent.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Reset password request failed.")),
  });

  const handleForgotPassword = (values: ForgotPasswordSchema) => {
    forgotPasswordMutation.mutate({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(handleForgotPassword)} noValidate>
      <FormField label="Email address" type="email" placeholder="you@example.com" autoComplete="email" disabled={forgotPasswordMutation.isPending} error={errors.email} {...register("email")} />
      <FormActions
        isSubmitting={forgotPasswordMutation.isPending}
        submitLabel={forgotPasswordMutation.isPending ? "Sending reset link..." : "Send reset link"}
        helperText={`We will send a password reset link to ${watch("email") || "your inbox"} if the account exists.`}
        secondaryAction={<p className="text-sm text-[var(--color-muted-foreground)]">Back to <Link href="/login" className="font-semibold text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]">sign in</Link></p>}
      />
    </form>
  );
}
