"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { authService } from "@/services/auth.service";

type AuthGoogleButtonProps = {
  callbackPath?: string | null;
  newUserCallbackPath?: string;
  errorCallbackPath?: string;
  label?: string;
  disabled?: boolean;
};

const toAbsoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, window.location.origin).toString();
};

export function AuthGoogleButton({
  callbackPath,
  newUserCallbackPath = "/account",
  errorCallbackPath = "/login?social=error",
  label = "Continue with Google",
  disabled = false,
}: AuthGoogleButtonProps) {
  const googleMutation = useMutation({
    mutationFn: async () => authService.signInWithGoogle({
      callbackURL: toAbsoluteUrl(callbackPath || "/account"),
      newUserCallbackURL: toAbsoluteUrl(newUserCallbackPath),
      errorCallbackURL: toAbsoluteUrl(errorCallbackPath),
    }),
    onSuccess: (response) => {
      if (!response.url) {
        toast.error("Google login is not available right now.");
        return;
      }

      window.location.href = response.url;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Google login could not be started."));
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleMutation.mutate()}
      disabled={disabled || googleMutation.isPending}
      className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-page)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] text-xs font-bold text-[var(--color-primary)]">
        G
      </span>
      {googleMutation.isPending ? "Redirecting..." : label}
    </button>
  );
}
