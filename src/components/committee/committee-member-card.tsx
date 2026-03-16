import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Mail, MessageCircle } from "lucide-react";
import { SiteCommitteeMember } from "@/types/settings.types";

type CommitteeMemberCardProps = {
  member: SiteCommitteeMember;
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
    <article className="surface-card flex h-full flex-col items-center rounded-[1.75rem] p-5 text-center sm:p-6">
      {member.photoUrl ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] shadow-sm">
          <Image src={member.photoUrl} alt={member.name} fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,var(--color-primary-soft),var(--color-accent-soft))] text-2xl font-semibold text-[var(--color-primary-strong)] shadow-sm">
          {initials}
        </div>
      )}

      <div className="mt-5 flex flex-1 flex-col items-center justify-center">
        <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{member.name}</h3>
        <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">{member.role}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{member.department}</p>
        {member.bio ? <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-muted-foreground)]">{member.bio}</p> : null}
      </div>

      {socialItems.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--color-border)] pt-4">
          {socialItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={`${member.name}-${item.label}`}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${member.name} ${item.label}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/70 text-[var(--color-primary)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-secondary)] hover:shadow-sm"
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
