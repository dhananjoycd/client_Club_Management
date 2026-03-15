import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-page)] px-6 py-12 text-center">
      <div className="rounded-2xl bg-white p-3 text-[var(--color-primary)] shadow-sm">
        <Inbox className="h-6 w-6" />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </div>
  );
}
