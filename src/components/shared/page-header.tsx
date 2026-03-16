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
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between">
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
