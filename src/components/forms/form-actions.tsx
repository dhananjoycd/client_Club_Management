import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormActionsProps = {
  isSubmitting?: boolean;
  submitLabel: string;
  helperText?: string;
  secondaryAction?: ReactNode;
};

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function FormActions({
  isSubmitting,
  submitLabel,
  helperText,
  secondaryAction,
  ...buttonProps
}: FormActionsProps & SubmitButtonProps) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <button
        type="submit"
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        )}
        disabled={isSubmitting || buttonProps.disabled}
        {...buttonProps}
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
      {helperText ? <p className="text-sm text-[var(--color-muted-foreground)]">{helperText}</p> : null}
      {secondaryAction ? <div>{secondaryAction}</div> : null}
    </div>
  );
}
