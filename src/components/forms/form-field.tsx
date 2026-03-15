import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  label: string;
  error?: FieldError;
  className?: string;
};

type FormFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;

type FormTextareaProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormField({ label, error, className, id, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label htmlFor={fieldId} className="grid gap-2">
      <span className="text-sm font-medium text-[var(--color-primary)]">{label}</span>
      <input
        id={fieldId}
        className={cn(
          "h-11 rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[#dbeafe] disabled:cursor-not-allowed disabled:bg-slate-100",
          error ? "border-rose-400 focus:ring-rose-100" : "",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${fieldId}-error`} className="text-sm text-rose-600">
          {error.message}
        </span>
      ) : null}
    </label>
  );
}

export function FormTextarea({ label, error, className, id, ...props }: FormTextareaProps) {
  const fieldId = id ?? props.name;

  return (
    <label htmlFor={fieldId} className="grid gap-2">
      <span className="text-sm font-medium text-[var(--color-primary)]">{label}</span>
      <textarea
        id={fieldId}
        className={cn(
          "min-h-28 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[#dbeafe] disabled:cursor-not-allowed disabled:bg-slate-100",
          error ? "border-rose-400 focus:ring-rose-100" : "",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${fieldId}-error`} className="text-sm text-rose-600">
          {error.message}
        </span>
      ) : null}
    </label>
  );
}
