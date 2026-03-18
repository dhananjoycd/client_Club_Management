"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField } from "@/components/forms/form-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const status = searchParams.get("status");
  const sent = searchParams.get("sent");
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email },
  });

  const resendMutation = useMutation({
    mutationFn: authService.sendVerificationEmail,
    onSuccess: () => toast.success("Verification email sent. Check your inbox."),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not send verification email.")),
  });

  if (status === "success") {
    return (
      <div className="grid gap-5">
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <h2 className="text-lg font-semibold">Email verified</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-800">
            Your email address has been verified successfully. You can now sign in to your account.
          </p>
        </div>
        <Link href="/login" className="primary-button inline-flex h-11 items-center justify-center px-5 text-sm">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
        {sent === "1"
          ? "Your account was created. Check your inbox to verify your email before signing in."
          : "Verify your email address to activate your account. If needed, send another verification email below."}
      </div>

      <form
        className="grid gap-5"
        onSubmit={handleSubmit((values) => resendMutation.mutate({
          email: values.email,
          callbackURL: `${window.location.origin}/verify-email?status=success`,
        }))}
        noValidate
      >
        <FormField label="Email address" type="email" placeholder="you@example.com" autoComplete="email" disabled={resendMutation.isPending} error={errors.email} {...register("email")} />
        <FormActions
          isSubmitting={resendMutation.isPending}
          submitLabel={resendMutation.isPending ? "Sending verification email..." : "Resend verification email"}
          helperText="Open the verification email and complete the confirmation before signing in."
          secondaryAction={<p className="text-sm text-[var(--color-muted-foreground)]">Already verified? <Link href="/login" className="font-semibold text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]">Go to sign in</Link></p>}
        />
      </form>
    </div>
  );
}
