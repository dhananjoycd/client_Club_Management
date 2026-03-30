import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormActionsProps = {
  isSubmitting?: boolean;
  submitLabel: string;
  submittingLabel?: string;
  submittingHint?: string;
  helperText?: string;
  secondaryAction?: ReactNode;
};

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function FormActions({
  isSubmitting,
  submitLabel,
  submittingLabel = "Submitting...",
  submittingHint,
  helperText,
  secondaryAction,
  ...buttonProps
}: FormActionsProps & SubmitButtonProps) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <button
        type="submit"
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        )}
        disabled={isSubmitting || buttonProps.disabled}
        {...buttonProps}
      >
        {isSubmitting ? (
          <>
            <span className="relative inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/18" />
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
            </span>
            <span>{submittingLabel}</span>
          </>
        ) : submitLabel}
      </button>
      {isSubmitting && submittingHint ? (
        <div className="flex items-start gap-2 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[var(--color-secondary)]" aria-hidden="true" />
          <p>{submittingHint}</p>
        </div>
      ) : null}
      {helperText ? <p className="text-sm text-[var(--color-muted-foreground)]">{helperText}</p> : null}
      {secondaryAction ? <div>{secondaryAction}</div> : null}
    </div>
  );
}
