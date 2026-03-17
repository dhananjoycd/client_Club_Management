import { LoaderCircle } from "lucide-react";

type ActionLoadingOverlayProps = {
  open: boolean;
  title: string;
  description: string;
};

export function ActionLoadingOverlay({ open, title, description }: ActionLoadingOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="surface-card flex w-full max-w-md flex-col items-center rounded-[2rem] p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </div>
  );
}
