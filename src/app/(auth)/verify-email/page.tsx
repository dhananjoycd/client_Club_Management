import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";

export default function VerifyEmailPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">Verify your email</h1>
        <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
          Email verification is required before you can sign in with your account.
        </p>
      </div>
      <Suspense fallback={<LoadingState title="Loading verification" description="Preparing the email verification panel." />}>
        <VerifyEmailPanel />
      </Suspense>
    </div>
  );
}
