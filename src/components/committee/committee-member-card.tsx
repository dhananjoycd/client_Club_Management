import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Mail, MessageCircle } from "lucide-react";
import { CommitteeDisplayMember } from "@/types/committee.types";

type CommitteeMemberCardProps = {
  member: CommitteeDisplayMember;
  compact?: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getWhatsAppHref(value?: string) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

export function CommitteeMemberCard({ member }: CommitteeMemberCardProps) {
  const initials = getInitials(member.name || "Club Member");
  const whatsappHref = getWhatsAppHref(member.whatsapp);
  const socialItems = [
    member.facebookUrl ? { href: member.facebookUrl, label: "Facebook", icon: Facebook } : null,
    member.linkedinUrl ? { href: member.linkedinUrl, label: "LinkedIn", icon: Linkedin } : null,
    whatsappHref ? { href: whatsappHref, label: "WhatsApp", icon: MessageCircle } : null,
    member.email ? { href: `mailto:${member.email}`, label: "Email", icon: Mail } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof Facebook }>;

  return (
    <article className="group relative flex h-full flex-col items-center overflow-hidden rounded-[2rem] app-card p-6 text-center shadow-[0_18px_44px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(14,165,233,0.34)] hover:shadow-[0_24px_56px_rgba(15,23,42,0.1)] dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(14,30,47,0.96),rgba(10,22,36,0.98))] dark:shadow-[0_20px_46px_rgba(2,8,23,0.28)] sm:p-7">
      <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.35),transparent)]" />
      {member.photoUrl ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-[1.6rem] app-card-page shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <Image src={member.photoUrl} alt={member.name} fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,var(--color-primary-soft),var(--color-accent-soft))] text-2xl font-semibold text-[var(--color-primary-strong)] shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          {initials}
        </div>
      )}

      <div className="mt-5 flex flex-1 flex-col items-center justify-center">
        <span className="inline-flex items-center rounded-full border border-[rgba(14,165,233,0.14)] bg-[linear-gradient(180deg,rgba(230,251,253,0.92),rgba(240,249,255,0.9))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)] dark:border-[rgba(14,165,233,0.16)] dark:bg-[rgba(14,165,233,0.08)]">Executive Member</span>
        <h3 className="mt-4 text-[1.8rem] font-semibold tracking-tight text-[var(--color-primary-strong)]">{member.name}</h3>
        <p className="mt-3 text-[15px] font-semibold text-[var(--color-foreground)]">{member.role}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{member.department}</p>
        {member.bio ? <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--color-muted-foreground)]">{member.bio}</p> : null}
      </div>

      {socialItems.length > 0 ? (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 border-t border-[rgba(148,163,184,0.2)] pt-5">
          {socialItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={`${member.name}-${item.label}`}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${member.name} ${item.label}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full app-card-subtle text-[var(--color-primary)] shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[rgba(14,165,233,0.32)] hover:text-[var(--color-secondary)] hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,rgba(15,31,48,0.98),rgba(10,22,36,1))]"
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}


