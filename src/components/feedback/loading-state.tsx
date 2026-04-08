type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = "Loading Club Portal",
  description = "Please wait while XYZ Tech Club prepares the latest page data for you.",
}: LoadingStateProps) {
  return (
    <div className="surface-card overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative mt-1 flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[var(--color-primary-soft)]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-[var(--color-primary)]" />
            <span className="absolute inset-0 rounded-[1.25rem] ring-1 ring-inset ring-[var(--color-border)]" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              Live loading state
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-2xl">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
              {description}
            </p>
          </div>
        </div>
        <div className="hidden min-w-[11rem] rounded-[1.5rem] app-card-subtle p-4 lg:block">
          <div className="space-y-3 animate-pulse">
            <div className="h-2.5 w-20 rounded-full bg-slate-200" />
            <div className="h-8 rounded-2xl bg-slate-100" />
            <div className="h-2.5 w-16 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.75rem] app-card-subtle p-5"
          >
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="h-9 w-9 rounded-full bg-slate-100" />
              </div>
              <div className="h-5 w-2/3 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded-full bg-slate-100" />
                <div className="h-3.5 w-5/6 rounded-full bg-slate-100" />
                <div className="h-3.5 w-3/5 rounded-full bg-slate-100" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-10 flex-1 rounded-full bg-slate-100" />
                <div className="h-10 w-24 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

