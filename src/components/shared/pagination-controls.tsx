"use client";

import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const normalizedPages = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  normalizedPages.forEach((page, index) => {
    const previous = normalizedPages[index - 1];
    if (previous && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

export function PaginationControls({ currentPage, totalPages, onPageChange, className }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages);

  return (
    <div className={cn("flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="secondary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Prev
        </button>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-[var(--color-muted-foreground)]">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition",
                item == currentPage
                  ? "border-[var(--color-accent)] bg-[var(--color-primary)] text-white shadow-[0_12px_28px_rgba(13,64,147,0.18)]"
                  : "border-[var(--color-border)] bg-white/80 text-[var(--color-primary-strong)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]",
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <label className="flex items-center justify-center gap-3 text-sm text-[var(--color-muted-foreground)] sm:justify-end">
        <span>Page</span>
        <select
          value={currentPage}
          onChange={(event) => onPageChange(Number(event.target.value))}
          className="input-base h-10 min-w-24 px-3 py-0 text-sm"
        >
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
