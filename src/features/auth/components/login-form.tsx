"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField } from "@/components/forms/form-field";
import { PasswordField } from "@/components/forms/password-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { LoginPayload } from "@/types/auth.types";
import { AuthGoogleButton } from "./auth-google-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectTo = searchParams.get("redirect");
  const resetStatus = searchParams.get("reset");
  const socialStatus = searchParams.get("social");
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", rememberMe: false } });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (response) => {
      queryClient.setQueryData(queryKeys.auth.session, response);
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.session, type: "active" });
      toast.success("Welcome back. Your account is ready.");
      const user = response.data?.user;
      const fallback = user?.role === "USER" || user?.role === "MEMBER" ? "/account" : "/admin";
      router.push(redirectTo || fallback);
    },
  });

  const currentUser = sessionQuery.data?.data?.user;

  useEffect(() => {
    if (!currentUser) return;

    const fallback = currentUser.role === "USER" || currentUser.role === "MEMBER" ? "/account" : "/admin";
    router.replace(redirectTo || fallback);
  }, [currentUser, redirectTo, router]);

  const handleLogin = (values: LoginPayload) => {
    loginMutation.mutate(values, {
      onError: (error) => {
        const message = getApiErrorMessage(error, "Login failed. Please try again.");

        if (/EMAIL_NOT_VERIFIED|verify/i.test(message)) {
          toast.error("Your email is not verified yet. Please verify it first to continue.");
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }

        toast.error(getApiErrorMessage(error, "We could not sign you in right now. Check your email and password, then try again."));
      },
    });
  };

  return (
    <div className="grid gap-5">
      {resetStatus === "1" ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Your password has been reset. Sign in with your new password.
        </div>
      ) : null}
      {socialStatus === "error" ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Google login could not be completed. Please try again or use your email and password.
        </div>
      ) : null}
      {currentUser ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          You are already signed in as {currentUser.email}.
        </div>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit(handleLogin)} noValidate>
        <FormField label="Email address" type="email" placeholder="member@example.com" autoComplete="email" disabled={loginMutation.isPending} error={errors.email} {...register("email")} />
        <PasswordField label="Password" placeholder="Enter your password" autoComplete="current-password" disabled={loginMutation.isPending} error={errors.password} {...register("password")} />
        <label className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]"><input type="checkbox" className="h-4 w-4" disabled={loginMutation.isPending} {...register("rememberMe")} /><span>Keep me signed in</span></label>
        <FormActions
          isSubmitting={loginMutation.isPending}
          submitLabel="Sign in"
          submittingLabel="Signing you in..."
          submittingHint="Checking your account details and preparing your dashboard access. This usually takes a moment."
          helperText="Sign in to access your dashboard, registrations, and account updates."
          secondaryAction={
            currentUser ? (
              <p className="text-sm font-medium text-emerald-700">Your account is already active. Use your dashboard instead of the membership application.</p>
            ) : (
              <div className="grid gap-4 pt-1">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link href="/verify-email" className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-sm font-medium text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:bg-white hover:text-[var(--color-primary)]">Verify email</Link>
                  <Link href="/forgot-password" className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] px-4 text-sm font-medium text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:bg-white hover:text-[var(--color-primary)]">Forgot password</Link>
                </div>
                <p className="text-center text-sm text-[var(--color-muted-foreground)]">
                  New here? <Link href="/register" className="font-semibold text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]">Create an account</Link>
                </p>
                <div className="grid gap-4 border-t border-[var(--color-border)] pt-4">
                  <div className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">or continue with Google</div>
                  <AuthGoogleButton callbackPath={redirectTo} />
                </div>
              </div>
            )
          }
        />
      </form>
    </div>
  );
}






