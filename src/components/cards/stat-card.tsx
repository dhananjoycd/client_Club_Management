import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-[var(--color-primary-soft)] p-3 text-[var(--color-primary)]">{icon}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p> : null}
    </div>
  );
}
