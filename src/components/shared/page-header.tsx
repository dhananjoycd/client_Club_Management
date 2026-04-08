import { ReactNode } from "react";
import { MotionReveal } from "@/components/motion/motion-shell";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <MotionReveal>
      <div className="app-card-soft flex flex-col gap-4 rounded-[2rem] p-6 shadow-[0_16px_38px_rgba(15,23,42,0.035)] dark:bg-[linear-gradient(180deg,rgba(10,24,40,0.92),rgba(8,18,31,0.98))] dark:shadow-[0_24px_70px_rgba(2,8,23,0.4)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <span className="inline-flex rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
              {eyebrow}
            </span>
          ) : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-4xl">{title}</h1>
            {description ? (
              <p className="max-w-2xl text-base leading-7 text-[var(--color-muted-foreground)]">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex w-full items-center gap-3 lg:w-auto lg:shrink-0 lg:justify-end">{actions}</div> : null}
      </div>
    </MotionReveal>
  );
}

