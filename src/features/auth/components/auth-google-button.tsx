"use client";

import { useState } from "react";
import { toast } from "sonner";
import { joinUrl } from "@/lib/utils";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? joinUrl(process.env.NEXT_PUBLIC_API_URL, "") : "";
  const socialSignInUrl = apiBaseUrl ? joinUrl(apiBaseUrl, "/auth/sign-in/social") : "";
  const callbackURL = toAbsoluteUrl(callbackPath || "/account");
  const newUserCallbackURL = toAbsoluteUrl(newUserCallbackPath);
  const errorCallbackURL = toAbsoluteUrl(errorCallbackPath);

  return (
    <form
      action={socialSignInUrl}
      method="post"
      onSubmit={(event) => {
        if (!socialSignInUrl) {
          event.preventDefault();
          toast.error("Google login is not available right now.");
          return;
        }

        setIsRedirecting(true);
      }}
    >
      <input type="hidden" name="provider" value="google" />
      <input type="hidden" name="callbackURL" value={callbackURL} />
      <input type="hidden" name="newUserCallbackURL" value={newUserCallbackURL} />
      <input type="hidden" name="errorCallbackURL" value={errorCallbackURL} />
      <button
        type="submit"
        disabled={disabled || isRedirecting}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-page)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] text-xs font-bold text-[var(--color-primary)]">
          G
        </span>
        {isRedirecting ? "Redirecting..." : label}
      </button>
    </form>
  );
}
