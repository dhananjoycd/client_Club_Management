"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/notices", label: "Notices" },
  { href: "/apply", label: "Apply" },
  { href: "/login", label: "Login" },
];

export function PublicNavbar() {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--color-primary)]">
          Club Management
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-primary)] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
