"use client";

import Link from "next/link";
import { Facebook, Github, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";

const socialConfig = {
  facebook: { label: "Facebook", icon: Facebook },
  linkedin: { label: "LinkedIn", icon: Linkedin },
  github: { label: "GitHub", icon: Github },
} as const;

const socialLabels = Object.keys(socialConfig) as Array<keyof typeof socialConfig>;

export function PublicFooter() {
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const settings = settingsQuery.data?.data;
  const organizationName = settings?.organizationName?.trim() || "XYZ Tech Club";
  const email = settings?.contactEmail?.trim() || "hello@xyztechclub.org";
  const phone = settings?.phone?.trim() || "+880 1234-567890";
  const socialLinks = settings?.socialLinks ?? {};
  const restrictedRoles = new Set(["MEMBER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]);
  const isRestrictedUser = restrictedRoles.has(sessionQuery.data?.data?.user?.role ?? "");
  const activeSocialLinks = socialLabels
    .map((label) => [label, socialLinks[label]] as const)
    .filter(([, href]) => typeof href === "string" && href.trim().length > 0);

  return (
    <footer className="mt-12 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#091429,#071020)] text-[rgba(237,244,255,0.92)] sm:mt-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-8 lg:py-14">
        <div className="col-span-2 space-y-4 lg:col-span-1">
          <div className="inline-flex items-center rounded-full border border-[rgba(125,211,252,0.28)] bg-[rgba(125,211,252,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Club Portal
          </div>
          <div className="space-y-3">
            <h2 className="max-w-lg text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-tight text-white">
              One place for club events, updates, and member life.
            </h2>
            <div className="h-1 w-20 rounded-full bg-[linear-gradient(90deg,var(--color-accent),rgba(125,211,252,0.15))]" />
          </div>
          <p className="max-w-xl text-sm leading-7 text-[rgba(226,232,240,0.72)] sm:text-[15px]">
            Follow club notices, explore events, and stay connected with the people and activity shaping XYZ Tech Club on campus.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Quick links</p>
          <div className="grid gap-2 text-[rgba(226,232,240,0.72)]">
            <Link href="/" className="transition hover:text-[var(--color-accent)]">Home</Link>
            <Link href="/about" className="transition hover:text-[var(--color-accent)]">About</Link>
            <Link href="/events" className="transition hover:text-[var(--color-accent)]">Events</Link>
            <Link href="/notices" className="transition hover:text-[var(--color-accent)]">Notices</Link>
            <Link href="/committee" className="transition hover:text-[var(--color-accent)]">Committee</Link>
            <Link href="/testimonials" className="transition hover:text-[var(--color-accent)]">Testimonials</Link>
            {!isRestrictedUser ? <Link href="/apply" className="transition hover:text-[var(--color-accent)]">Apply</Link> : null}
          </div>
        </div>

        <div className="space-y-3 text-sm text-[rgba(226,232,240,0.72)]">
          <p className="font-semibold text-white">Connect</p>
          <p>{email}</p>
          <p>{phone}</p>
          <p>XYZ Tech Club connects students through practical events, teamwork, and campus tech culture.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            {activeSocialLinks.length > 0 ? (
              activeSocialLinks.map(([label, href]) => {
                const Icon = socialConfig[label].icon;

                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={socialConfig[label].label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })
            ) : (
              socialLabels.map((label) => {
                const Icon = socialConfig[label].icon;

                return (
                  <span
                    key={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-[rgba(226,232,240,0.5)]"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-4 py-4 text-center text-sm text-[rgba(226,232,240,0.64)] sm:px-6 lg:px-8">
          <p>&copy; {currentYear ?? ""} {organizationName}. Built for student communities.</p>
          <p>
            Developed by{" "}
            <a
              href="https://github.com/dhananjoycd"
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-[#7dd3fc] transition hover:text-[#bae6fd]"
            >
              Dhananjoy
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
