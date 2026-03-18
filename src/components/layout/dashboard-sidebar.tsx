"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";

type NavigationLink = {
  href: string;
  label: string;
  allowedRoles?: string[];
};

type DashboardSidebarProps = {
  heading: string;
  links: NavigationLink[];
};

export function DashboardSidebar({ heading, links }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  const userRole = sessionQuery.data?.data?.user?.role;
  const visibleLinks = useMemo(
    () => links.filter((link) => !link.allowedRoles || (userRole ? link.allowedRoles.includes(userRole) : true)),
    [links, userRole],
  );
  const activeLink = useMemo(
    () => visibleLinks.find((link) => pathname === link.href),
    [visibleLinks, pathname],
  );

  return (
    <aside className="sticky top-[4.75rem] z-20 w-full border-b border-[var(--color-border)] bg-white lg:top-[4.75rem] lg:h-[calc(100vh-4.75rem)] lg:w-72 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="px-4 py-4 sm:px-6 lg:py-5">
        <div className="hidden lg:block">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Dashboard</p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-primary)]">{heading}</h2>
          </div>

          <nav className="mt-6 grid gap-2">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-xl border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[var(--color-accent)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                      : "border-transparent text-[var(--color-muted-foreground)] hover:bg-[var(--color-page)] hover:text-[var(--color-primary)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="surface-card flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle dashboard menu"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Dashboard Menu</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-primary-strong)]">{activeLink?.label ?? heading}</p>
            </div>
            <ChevronDown className={cn("h-5 w-5 text-[var(--color-primary)] transition-transform", isMobileMenuOpen ? "rotate-180" : "rotate-0")} />
          </button>

          {isMobileMenuOpen ? (
            <nav className="mt-3 grid gap-2">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "rounded-xl border-l-2 px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-[var(--color-accent)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                        : "border-transparent bg-white text-[var(--color-muted-foreground)] hover:bg-[var(--color-page)] hover:text-[var(--color-primary)]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
