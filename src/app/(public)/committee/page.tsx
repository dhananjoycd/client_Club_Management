import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { committeePreview } from "@/features/home/home-content";
import { settingsService } from "@/services/settings.service";
import { SiteCommitteeMember, SiteSettings } from "@/types/settings.types";

const defaultCommitteeGroupPhotoUrl = "https://media.istockphoto.com/id/1400051391/photo/portrait-of-successful-team-at-the-office.jpg?s=612x612&w=0&k=20&c=-JPTGPOpKyIgvFymzYRg1XecuUJsXgdY0k5DeDMBi30=";

async function getCommitteeData(): Promise<{ committeeMembers: SiteCommitteeMember[]; committeeGroupPhotoUrl?: string }> {
  try {
    const result = await settingsService.getSettings();
    const settings: SiteSettings | null | undefined = result.data;
    const configuredMembers = settings?.committeeMembers ?? [];

    return {
      committeeMembers: configuredMembers.length > 0 ? configuredMembers : committeePreview,
      committeeGroupPhotoUrl: settings?.committeeGroupPhotoUrl?.trim() || defaultCommitteeGroupPhotoUrl,
    };
  } catch {
    // Fall back to bundled preview data when the settings endpoint is unavailable.
  }

  return { committeeMembers: committeePreview, committeeGroupPhotoUrl: defaultCommitteeGroupPhotoUrl };
}

export default async function CommitteePage() {
  const { committeeMembers, committeeGroupPhotoUrl } = await getCommitteeData();

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Committee"
          title="Executive committee members of XYZ Tech Club."
          description="Updated from settings so the public page always shows the latest committee lineup."
          actions={
            <MembershipApplyCta
              label="Join the Club"
              className="primary-button h-11 px-5 text-sm"
            />
          }
        />

        <SectionWrapper title="Committee members" description="Leadership profiles of the club committee.">
          <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white/60 p-3">
            <div className="relative aspect-[16/7] overflow-hidden rounded-[1.25rem]">
              <Image
                src={committeeGroupPhotoUrl || defaultCommitteeGroupPhotoUrl}
                alt="Committee group photo"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 72rem"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {committeeMembers.map((member) => (
              <CommitteeMemberCard key={`${member.name}-${member.role}`} member={member} />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <MembershipApplyCta
              label="Apply to become a member"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
            />
          </div>
        </SectionWrapper>
      </div>
    </main>
  );
}
