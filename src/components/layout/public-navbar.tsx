"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/notices", label: "Notices" },
  { href: "/apply", label: "Apply" },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Logged out successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      router.push("/");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Logout failed.")),
  });

  const user = sessionQuery.data?.data?.user;
  const dashboardHref = user?.role === "MEMBER" ? "/member" : user ? "/admin" : null;
  const navLinks = [...publicLinks, ...(user ? [] : [{ href: "/login", label: "Login" }])];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--color-primary)]">Club Management</Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return <Link key={link.href} href={link.href} className={cn("text-sm font-medium transition-colors", isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]")}>{link.label}</Link>;
          })}
          {dashboardHref ? <Link href={dashboardHref} className="text-sm font-medium text-[var(--color-primary)]">Dashboard</Link> : null}
          {user ? <button type="button" onClick={() => logoutMutation.mutate()} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-primary)]">Logout</button> : null}
        </nav>

        <button type="button" aria-label={isOpen ? "Close navigation" : "Open navigation"} aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-primary)] md:hidden">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-[var(--color-border)] bg-white md:hidden">
          <nav className="mx-auto grid w-full max-w-6xl gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={cn("rounded-xl px-3 py-3 text-sm font-medium transition-colors", isActive ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-page)] hover:text-[var(--color-primary)]")}>{link.label}</Link>;
            })}
            {dashboardHref ? <Link href={dashboardHref} onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-page)]">Dashboard</Link> : null}
            {user ? <button type="button" onClick={() => { setIsOpen(false); logoutMutation.mutate(); }} className="rounded-xl border border-[var(--color-border)] px-3 py-3 text-left text-sm font-medium text-[var(--color-primary)]">Logout</button> : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
