"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { joinUrl } from "@/lib/utils";

type AuthGoogleButtonProps = {
  callbackPath?: string | null;
  newUserCallbackPath?: string;
  errorCallbackPath?: string;
  label?: string;
  disabled?: boolean;
};

const toAbsoluteUrl = (value: string, origin: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  return origin ? new URL(value, origin).toString() : "";
};

export function AuthGoogleButton({
  callbackPath,
  newUserCallbackPath = "/account",
  errorCallbackPath = "/login?social=error",
  label = "Continue with Google",
  disabled = false,
}: AuthGoogleButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? joinUrl(process.env.NEXT_PUBLIC_API_URL, "") : "";
  const socialSignInUrl = apiBaseUrl ? joinUrl(apiBaseUrl, "/auth/sign-in/social") : "";
  const callbackURL = toAbsoluteUrl(callbackPath || "/account", origin);
  const newUserCallbackURL = toAbsoluteUrl(newUserCallbackPath, origin);
  const errorCallbackURL = toAbsoluteUrl(errorCallbackPath, origin);
  const isUnavailable = !socialSignInUrl || !origin;

  return (
    <form
      action={socialSignInUrl || undefined}
      method="post"
      onSubmit={(event) => {
        if (isUnavailable) {
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
        disabled={disabled || isRedirecting || isUnavailable}
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
