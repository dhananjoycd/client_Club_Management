import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-100",
        active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-200",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-400/18 dark:text-amber-200",
        inactive: "bg-rose-100 text-rose-700 dark:bg-rose-500/18 dark:text-rose-200",
        info: "bg-blue-100 text-blue-700 dark:bg-sky-500/18 dark:text-sky-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  label: string;
  className?: string;
};

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ variant }), className)}>{label}</span>;
}
