import { ReactNode } from "react";
import { MotionReveal } from "@/components/motion/motion-shell";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, description, icon, className }: StatCardProps) {
  return (
    <MotionReveal className={className}>
      <div className="surface-card h-full rounded-[1.5rem] p-4 transition-transform duration-300 ease-out hover:-translate-y-1 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p>
            <p className="text-2xl font-semibold leading-tight tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">{value}</p>
          </div>
          {icon ? <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)] sm:h-12 sm:w-12">{icon}</div> : null}
        </div>
        {description ? <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)] sm:leading-7">{description}</p> : null}
      </div>
    </MotionReveal>
  );
}

