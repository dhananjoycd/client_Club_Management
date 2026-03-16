import { ReactNode } from "react";
import { MotionReveal } from "@/components/motion/motion-shell";

type SectionWrapperProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionWrapper({ title, description, children, className }: SectionWrapperProps) {
  return (
    <MotionReveal className={className}>
      <section className="surface-card h-full rounded-[2rem] p-5 sm:p-7 lg:p-8">
        {title || description ? (
          <div className="mb-6 space-y-2 sm:mb-8">
            {title ? <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">{title}</h2> : null}
            {description ? <p className="max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </section>
    </MotionReveal>
  );
}
