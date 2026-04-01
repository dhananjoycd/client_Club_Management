"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { accountService } from "@/services/account.service";
import { applicationService } from "@/services/application.service";
import { settingsService } from "@/services/settings.service";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/notices", label: "Notices" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/committee", label: "Committee" },
  { href: "/contact", label: "Contact" },
];

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const user = sessionQuery.data?.data?.user;
  const shouldLoadMemberData = user?.role === "USER" || user?.role === "MEMBER";
  const accountProfileQuery = useQuery({
    queryKey: queryKeys.account.profile,
    queryFn: accountService.getProfile,
    enabled: shouldLoadMemberData,
    retry: false,
  });
  const applicationQuery = useQuery({
    queryKey: queryKeys.applications.list("me"),
    queryFn: () => applicationService.getApplications({ limit: 20 }),
    retry: false,
    enabled: shouldLoadMemberData,
  });
  const settings = settingsQuery.data?.data;
  const accountProfile = accountProfileQuery.data?.data;
  const isNavbarAuthLoading = sessionQuery.isLoading || (shouldLoadMemberData && (accountProfileQuery.isLoading || applicationQuery.isLoading));
  const organizationName = settings?.organizationName?.trim() || "XYZ Tech Club";
  const logoImage = settings?.logoUrl?.trim() || null;
  const dashboardHref = user?.role === "USER" || user?.role === "MEMBER" ? "/account" : user ? "/admin" : null;
  const restrictedRoles = new Set(["MEMBER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]);
  const latestApplication = [...(applicationQuery.data?.data?.result ?? [])]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
  const showJoinNow = !user
    ? true
    : restrictedRoles.has(user.role)
      ? false
      : latestApplication
        ? latestApplication.status === "REJECTED"
        : true;
  const avatarImage = useMemo(
    () => user?.image?.trim() || accountProfile?.memberProfile?.profilePhoto?.trim() || null,
    [accountProfile?.memberProfile?.profilePhoto, user?.image],
  );
  const avatarInitials = getInitials(accountProfile?.name ?? user?.name, user?.email);
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Logged out successfully.");
      setIsOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session }),
        queryClient.invalidateQueries({ queryKey: queryKeys.account.profile }),
      ]);
      router.push("/");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Logout failed.")),
  });

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const avatarButton = dashboardHref && user ? (
    <button
      type="button"
      onClick={() => {
        setIsOpen(false);
        router.push(dashboardHref);
      }}
      className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      aria-label="Go to dashboard"
      title="Go to dashboard"
    >
      {avatarImage ? (
        <span className="relative block h-full w-full">
          <Image src={avatarImage} alt={user.email} fill className="object-cover" sizes="44px" unoptimized />
        </span>
      ) : (
        <span className="text-sm font-semibold text-[var(--color-primary-strong)]">{avatarInitials}</span>
      )}
    </button>
  ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(249,251,254,0.78)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(249,251,254,0.68)]">
      <div className="mx-auto flex min-h-[4.75rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-[var(--color-primary-strong)] transition-transform duration-200 hover:scale-[1.01]">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-strong),var(--color-primary))] text-sm font-semibold text-white shadow-[0_16px_32px_rgba(15,76,189,0.24)]">
            {logoImage ? (
              <span className="relative block h-full w-full">
                <Image src={logoImage} alt={`${organizationName} logo`} fill className="object-cover" sizes="44px" unoptimized />
              </span>
            ) : (
              organizationName.slice(0, 2).toUpperCase()
            )}
          </span>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">Build / Learn / Lead</span>
            <span className="block truncate text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{organizationName}</span>
          </span>
        </Link>

        <nav className="surface-card hidden items-center gap-1 rounded-full px-2 py-2 md:flex">
          {publicLinks.map((link) => {
            const isAnchorLink = link.href.startsWith("/#");
            const linkHash = isAnchorLink ? link.href.slice(1) : "";
            const isActive = isAnchorLink ? pathname === "/" && activeHash === linkHash : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,76,189,0.14)]",
                  isActive
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-primary-strong)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isNavbarAuthLoading ? (
            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="h-11 w-11 animate-pulse rounded-full border border-[var(--color-border)] bg-white/80" />
              <div className="h-11 w-24 animate-pulse rounded-full border border-[var(--color-border)] bg-white/80" />
              <div className="h-11 w-28 animate-pulse rounded-full bg-[var(--color-primary-soft)]" />
            </div>
          ) : (
            <>
              {avatarButton}
              {!user ? <Link href="/login" className="secondary-button h-11 px-5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">Login</Link> : null}
              {!user ? <Link href="/register" className="secondary-button h-11 px-5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">Register</Link> : null}
              {showJoinNow ? <Link href="/apply" className="primary-button h-11 whitespace-nowrap px-5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.28)]">Join Now</Link> : null}
              {user ? (
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="secondary-button h-11 px-5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              ) : null}
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 text-[var(--color-primary-strong)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)] hover:shadow-md md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-[var(--color-border)] bg-[rgba(249,251,254,0.96)] md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            <nav className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-2">
              <div className="grid gap-1.5">
                {publicLinks.map((link) => {
                  const isAnchorLink = link.href.startsWith("/#");
                  const linkHash = isAnchorLink ? link.href.slice(1) : "";
                  const isActive = isAnchorLink ? pathname === "/" && activeHash === linkHash : pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "rounded-[1.1rem] px-4 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "border border-[var(--color-accent)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                          : "border border-transparent text-[var(--color-muted-foreground)] hover:border-[var(--color-border)] hover:bg-[var(--color-primary-soft)]/40 hover:text-[var(--color-primary-strong)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {isNavbarAuthLoading ? (
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-4" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-full border border-[var(--color-border)] bg-white/80" />
                  <div className="h-11 flex-1 animate-pulse rounded-2xl border border-[var(--color-border)] bg-white/80" />
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  {avatarButton ? (
                    avatarButton
                  ) : (
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-primary-strong)]">
                      {organizationName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-primary-strong)]">
                      {user ? accountProfile?.name ?? user.name ?? user.email : "Guest access"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                      {user ? "Account actions" : "Quick access"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {user ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dashboardHref ? (
                        <Link
                          href={dashboardHref === "/account" ? "/account/profile" : dashboardHref}
                          onClick={() => setIsOpen(false)}
                          className="secondary-button h-10 px-4 text-sm"
                        >
                          Profile
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className="secondary-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Link href="/login" onClick={() => setIsOpen(false)} className="secondary-button h-10 px-4 text-sm">
                        Login
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)} className="secondary-button h-10 px-4 text-sm">
                        Register
                      </Link>
                    </div>
                  )}
                  {showJoinNow ? (
                    <Link href="/apply" onClick={() => setIsOpen(false)} className="primary-button h-10 whitespace-nowrap px-4 text-sm">
                      Join Now
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}





