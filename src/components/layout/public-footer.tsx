"use client";

import Link from "next/link";
import { Facebook, Github, Linkedin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { settingsService } from "@/services/settings.service";

const socialConfig = {
  facebook: { label: "Facebook", icon: Facebook },
  linkedin: { label: "LinkedIn", icon: Linkedin },
  github: { label: "GitHub", icon: Github },
} as const;

const socialLabels = Object.keys(socialConfig) as Array<keyof typeof socialConfig>;

export function PublicFooter() {
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const settings = settingsQuery.data?.data;
  const organizationName = settings?.organizationName?.trim() || "XYZ Tech Club";
  const email = settings?.contactEmail?.trim() || "hello@xyztechclub.org";
  const phone = settings?.phone?.trim() || "+880 1234-567890";
  const socialLinks = settings?.socialLinks ?? {};
  const activeSocialLinks = socialLabels
    .map((label) => [label, socialLinks[label]] as const)
    .filter(([, href]) => typeof href === "string" && href.trim().length > 0);
  const today = new Date();
  const footerDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <footer className="mt-12 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#091429,#071020)] text-[rgba(237,244,255,0.92)] sm:mt-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-8 lg:py-14">
        <div className="col-span-2 space-y-4 lg:col-span-1">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Club Portal</p>
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-white">A cleaner digital home for events, members, and club activity.</h2>
          <p className="max-w-xl text-sm leading-7 text-[rgba(226,232,240,0.72)]">
            Manage announcements, showcase events, and help new members understand what your community is building.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Explore</p>
          <div className="grid gap-2 text-[rgba(226,232,240,0.72)]">
            <Link href="/about" className="transition hover:text-[var(--color-accent)]">About</Link>
            <Link href="/events" className="transition hover:text-[var(--color-accent)]">Events</Link>
            <Link href="/apply" className="transition hover:text-[var(--color-accent)]">Apply</Link>
            <Link href="/notices" className="transition hover:text-[var(--color-accent)]">Resources</Link>
            <Link href="/committee" className="transition hover:text-[var(--color-accent)]">Committee</Link>
          </div>
        </div>

        <div className="space-y-3 text-sm text-[rgba(226,232,240,0.72)]">
          <p className="font-semibold text-white">Connect</p>
          <p>{email}</p>
          <p>{phone}</p>
          <p>Main campus activity zone, member and event updates available through the platform.</p>
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
          <p>&copy; {today.getFullYear()} {organizationName}. Built for student communities.</p>
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
