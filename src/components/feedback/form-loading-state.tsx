type FormLoadingStateProps = {
  title?: string;
  description?: string;
  fields?: number;
};

export function FormLoadingState({
  title = "Loading editor",
  description = "Preparing the form fields, saved values, and action controls.",
  fields = 7,
}: FormLoadingStateProps) {
  return (
    <div className="surface-card overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full app-card-subtle px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">
            Editor form
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-3xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">{description}</p>
        </div>
        <div className="h-11 w-full animate-pulse rounded-full bg-slate-100 sm:w-40" />
      </div>

      <div className="mt-6 grid gap-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="grid gap-2">
            <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className={`animate-pulse rounded-[1.25rem] bg-white/85 ${index % 3 === 1 ? "h-28" : "h-12"}`} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:justify-end">
        <div className="h-11 w-full animate-pulse rounded-full bg-slate-100 sm:w-32" />
        <div className="h-11 w-full animate-pulse rounded-full bg-slate-200 sm:w-40" />
      </div>
    </div>
  );
}

