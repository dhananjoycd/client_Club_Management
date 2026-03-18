"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField } from "@/components/forms/form-field";
import { PasswordField } from "@/components/forms/password-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { registerSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { RegisterPayload } from "@/types/auth.types";
import { AuthGoogleButton } from "./auth-google-button";

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      toast.success("Account created. Check your email to verify your address.");
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}&sent=1`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Registration failed. Please try again.")),
  });

  const currentUser = sessionQuery.data?.data?.user;
  const dashboardHref = currentUser?.role === "USER" || currentUser?.role === "MEMBER" ? "/account" : "/admin";

  if (currentUser) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <h2 className="text-lg font-semibold">You are already signed in</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-800">
          Your account is already active as <span className="font-semibold">{currentUser.email}</span>. You do not need to create another account from this page.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={dashboardHref} className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white">
            Go to dashboard
          </Link>
          <Link href="/" className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-800">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <form className="grid gap-5" onSubmit={handleSubmit((values) => registerMutation.mutate(values))} noValidate>
        <FormField label="Full name" type="text" placeholder="Your full name" autoComplete="name" disabled={registerMutation.isPending} error={errors.name} {...register("name")} />
        <FormField label="Email address" type="email" placeholder="you@example.com" autoComplete="email" disabled={registerMutation.isPending} error={errors.email} {...register("email")} />
        <PasswordField label="Password" placeholder="Create a strong password" autoComplete="new-password" disabled={registerMutation.isPending} error={errors.password} {...register("password")} />
        <FormActions
          isSubmitting={registerMutation.isPending}
          submitLabel="Create account"
          helperText="Create your account first, then verify your email before signing in and joining member features."
          secondaryAction={
            <div className="grid gap-4 pt-2">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Already have an account? <Link href="/login" className="font-semibold text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]">Login here</Link>
              </p>
              <div className="grid gap-4 border-t border-[var(--color-border)] pt-4">
                <div className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">or sign up with Google</div>
                <AuthGoogleButton label="Sign up with Google" />
              </div>
            </div>
          }
        />
      </form>
    </div>
  );
}
