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

  const handleGoogleSignIn = async () => {
    if (isUnavailable || isRedirecting) {
      toast.error("Google login is not available right now.");
      return;
    }

    setIsRedirecting(true);

    try {
      const response = await fetch(socialSignInUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        redirect: "manual",
        body: JSON.stringify({
          provider: "google",
          callbackURL,
          newUserCallbackURL,
          errorCallbackURL,
        }),
      });

      const locationHeader = response.headers.get("location");

      if (response.type === "opaqueredirect" || response.redirected) {
        window.location.assign(response.url || locationHeader || socialSignInUrl);
        return;
      }

      if (locationHeader) {
        window.location.assign(locationHeader);
        return;
      }

      let payload: unknown = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const redirectUrl =
        typeof payload === "object" && payload !== null
          ? ["url", "redirectTo", "redirectURL", "redirectUrl", "data"].reduce<string | null>((resolved, key) => {
              if (resolved) return resolved;

              const value = (payload as Record<string, unknown>)[key];
              if (typeof value === "string") return value;
              if (typeof value === "object" && value !== null) {
                const nestedUrl = (value as Record<string, unknown>).url;
                return typeof nestedUrl === "string" ? nestedUrl : null;
              }

              return null;
            }, null)
          : null;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      throw new Error("Unable to start Google login.");
    } catch (error) {
      console.error(error);
      toast.error("Google login could not be started.");
      setIsRedirecting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void handleGoogleSignIn();
        }}
        disabled={disabled || isRedirecting || isUnavailable}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-page)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] text-xs font-bold text-[var(--color-primary)]">
          G
        </span>
        {isRedirecting ? "Redirecting..." : label}
      </button>
    </div>
  );
}
