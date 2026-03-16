import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, description, icon }: StatCardProps) {
  return (
    <div className="surface-card rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{value}</p>
        </div>
        {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">{icon}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p> : null}
    </div>
  );
}
