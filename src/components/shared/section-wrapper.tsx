import { ReactNode } from "react";

type SectionWrapperProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function SectionWrapper({ title, description, children }: SectionWrapperProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
      {title || description ? (
        <div className="mb-6 space-y-2">
          {title ? <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary)]">{title}</h2> : null}
          {description ? <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
