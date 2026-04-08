type RouteLoadingShellProps = {
  badge: string;
  title: string;
  description: string;
  compact?: boolean;
  columns?: 2 | 3;
};

export function RouteLoadingShell({
  badge,
  title,
  description,
  compact = false,
  columns = 3,
}: RouteLoadingShellProps) {
  const gridClassName = columns === 2 ? "xl:grid-cols-2" : "xl:grid-cols-3";

  return (
    <div className="space-y-6">
      <section className="surface-card overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full app-card-subtle px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              {badge}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-[var(--color-primary)]" />
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-3xl">
                  {title}
                </h1>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
                {description}
              </p>
            </div>
          </div>
          <div className="grid min-w-[14rem] gap-3 rounded-[1.75rem] app-card-subtle p-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </section>

      <section className={`grid gap-4 md:grid-cols-2 ${gridClassName}`}>
        {Array.from({ length: compact ? 4 : 6 }).map((_, index) => (
          <div key={index} className="surface-card rounded-[1.75rem] p-5 sm:p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="h-10 w-10 rounded-full bg-slate-100" />
              </div>
              <div className="h-6 w-3/4 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded-full bg-slate-100" />
                <div className="h-3.5 w-5/6 rounded-full bg-slate-100" />
                <div className="h-3.5 w-2/3 rounded-full bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-10 rounded-full bg-slate-100" />
                <div className="h-10 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

