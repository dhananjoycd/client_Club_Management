type TableLoadingStateProps = {
  title?: string;
  description?: string;
  rows?: number;
};

export function TableLoadingState({
  title = "Loading table data",
  description = "Preparing the latest records for review.",
  rows = 6,
}: TableLoadingStateProps) {
  return (
    <div className="surface-card overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">
            Data table
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-3xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">{description}</p>
        </div>
        <div className="grid min-w-[14rem] gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-4">
          <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white/85">
        <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr_0.9fr] gap-4 border-b border-[var(--color-border)] px-5 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-3 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[2.2fr_1fr_1fr_1fr_0.9fr] gap-4 px-5 py-4">
              <div className="space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="h-9 animate-pulse rounded-full bg-slate-100" />
              <div className="h-9 animate-pulse rounded-full bg-slate-100" />
              <div className="h-9 animate-pulse rounded-full bg-slate-100" />
              <div className="h-10 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
