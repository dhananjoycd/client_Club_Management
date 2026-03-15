type DashboardTopbarProps = {
  title: string;
  description: string;
};

export function DashboardTopbar({ title, description }: DashboardTopbarProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-primary)]">{title}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </header>
  );
}
