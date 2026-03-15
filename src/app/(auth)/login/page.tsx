import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoadingState } from "@/components/feedback/loading-state";

export default function LoginPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">Welcome back</h1>
        <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
          Sign in to access your member or admin dashboard.
        </p>
      </div>
      <Suspense fallback={<LoadingState title="Loading login" description="Preparing the authentication form." />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
