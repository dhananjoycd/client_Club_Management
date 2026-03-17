"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  className?: string;
};

export function PasswordField({ label, error, className, id, ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = id ?? props.name;

  return (
    <label htmlFor={fieldId} className="grid gap-2">
      <span className="text-sm font-medium text-[var(--color-primary-strong)]">{label}</span>
      <div className="relative">
        <input
          id={fieldId}
          type={showPassword ? "text" : "password"}
          className={cn(
            "input-base h-12 w-full px-4 pr-12 text-sm",
            error ? "border-rose-400 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-muted-foreground)] transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <span id={`${fieldId}-error`} className="text-sm text-rose-600">
          {error.message}
        </span>
      ) : null}
    </label>
  );
}
