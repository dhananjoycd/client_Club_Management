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
      <span className="text-sm font-medium text-[var(--color-primary-strong)]">{label}</span>
      <input
        id={fieldId}
        className={cn(
          "input-base h-12 px-4 text-sm",
          error ? "border-rose-400 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "",
          className,
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
      <span className="text-sm font-medium text-[var(--color-primary-strong)]">{label}</span>
      <textarea
        id={fieldId}
        className={cn(
          "input-base min-h-32 px-4 py-3 text-sm",
          error ? "border-rose-400 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "",
          className,
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
