type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = "Loading content",
  description = "Please wait while the latest data is being prepared.",
}: LoadingStateProps) {
  return (
    <div className="rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-slate-200" />
        <div className="h-8 w-2/3 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-100" />
        <div className="h-4 w-5/6 rounded-full bg-slate-100" />
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium text-[var(--color-primary)]">{title}</p>
        <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </div>
  );
}
