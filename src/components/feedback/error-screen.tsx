"use client";

import Link from "next/link";
import { AlertTriangle, Home, LogIn, RefreshCw } from "lucide-react";

type ErrorScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorScreen({
  eyebrow,
  title,
  description,
  onRetry,
  retryLabel = "Try again",
}: ErrorScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-2xl rounded-[2rem] p-8 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-muted-foreground)]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
            {description}
          </p>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="primary-button h-12 w-full gap-2 px-6 sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              {retryLabel}
            </button>
          ) : null}
          <Link href="/" className="secondary-button h-12 w-full gap-2 px-6 sm:w-auto">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <Link href="/login" className="secondary-button h-12 w-full gap-2 px-6 sm:w-auto">
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
