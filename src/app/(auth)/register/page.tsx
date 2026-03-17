import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">Create your account</h1>
        <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
          Register first, then complete your profile before applying or joining events.
        </p>
      </div>
      <Suspense fallback={<LoadingState title="Loading register" description="Preparing the registration form." />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
