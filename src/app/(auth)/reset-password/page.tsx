import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">Reset your password</h1>
        <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
          Set a new password for your XYZ Tech Club account.
        </p>
      </div>
      <Suspense fallback={<LoadingState title="Loading reset password" description="Preparing your secure password reset form." />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
