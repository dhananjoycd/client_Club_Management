import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">Forgot password</h1>
        <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
          Enter your email address and we will send you a secure password reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
