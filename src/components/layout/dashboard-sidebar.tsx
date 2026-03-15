"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type NavigationLink = {
  href: string;
  label: string;
};

type DashboardSidebarProps = {
  heading: string;
  links: NavigationLink[];
};

export function DashboardSidebar({ heading, links }: DashboardSidebarProps) {
  return (
    <aside className="w-full border-b border-[var(--color-border)] bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-6 px-4 py-5 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
            Dashboard
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--color-primary)]">{heading}</h2>
        </div>

        <nav className="grid gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-page)] hover:text-[var(--color-primary)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
