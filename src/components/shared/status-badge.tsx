import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        active: "bg-emerald-100 text-emerald-700",
        pending: "bg-amber-100 text-amber-700",
        inactive: "bg-rose-100 text-rose-700",
        info: "bg-blue-100 text-blue-700",
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
