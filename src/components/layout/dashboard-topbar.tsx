type DashboardTopbarProps = {
  title: string;
  description: string;
};

export function DashboardTopbar({ title, description }: DashboardTopbarProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white/72 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </header>
  );
}
