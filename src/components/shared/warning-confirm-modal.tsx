"use client";

import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type WarningConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export function WarningConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Go Back",
  isLoading = false,
  children,
  onConfirm,
  onCancel,
}: WarningConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="surface-card mx-auto my-auto w-full max-w-md rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-amber-100 text-amber-600 dark:bg-[var(--color-warning-soft)] dark:text-[var(--color-warning)] shadow-[0_12px_30px_rgba(245,158,11,0.15)]">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p>
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="primary-button h-12 w-full whitespace-nowrap px-5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="secondary-button h-12 w-full whitespace-nowrap px-5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

