"use client";

import { cn } from "@/lib/utils";

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
};

export function FilterChip({ label, active, onClick, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition",
        active
          ? "border-[var(--color-accent)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-[0_12px_28px_rgba(37,99,235,0.12)] ring-1 ring-[rgba(14,165,233,0.18)]"
          : "border-[var(--color-border)] bg-white/80 text-[var(--color-primary-strong)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]",
        className,
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full border transition",
          active
            ? "border-[var(--color-accent)] bg-[var(--color-secondary)] shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
            : "border-[var(--color-border)] bg-transparent",
        )}
      />
      <span>{label}</span>
    </button>
  );
}
