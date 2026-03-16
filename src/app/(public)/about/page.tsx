import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Handshake, Layers3, Rocket, Target, Users2, Eye } from "lucide-react";
import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { MotionReveal } from "@/components/motion/motion-shell";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { committeePreview } from "@/features/home/home-content";
import { settingsService } from "@/services/settings.service";
import { SiteCommitteeMember, SiteSettings } from "@/types/settings.types";

const defaultAboutSectionPhotoUrl = "https://www.faulkner.edu/wp-content/uploads/college-students-working-on-a-group-project-Faulkner-University.jpg";

async function getAboutPageData(): Promise<SiteSettings | null> {
  try {
    const result = await settingsService.getSettings();
    return result.data ?? null;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const settings = await getAboutPageData();
  const organizationName = settings?.organizationName?.trim() || "XYZ Tech Club";
  const aboutStory =
    settings?.aboutText?.trim() ||
    `${organizationName} is a student-led technology community where students learn, build, collaborate, and contribute through workshops, events, projects, and practical campus activity.`;
  const mission =
    settings?.aboutMission?.trim() ||
    `Create an organized, practical, and welcoming tech community where students can grow through workshops, teamwork, projects, and leadership.`;
  const vision =
    settings?.aboutVision?.trim() ||
    `Build a trusted campus platform where students consistently learn, ship visible work, and become confident contributors in the wider tech community.`;
  const collaboration =
    settings?.aboutCollaboration?.trim() ||
    `The club grows through campus collaboration, faculty support, mentor guidance, and peer coordination across events, sessions, and projects.`;
  const aboutSectionPhotoUrl = settings?.aboutSectionPhotoUrl?.trim() || defaultAboutSectionPhotoUrl;
  const committeeMembers: SiteCommitteeMember[] = settings?.committeeMembers?.length ? settings.committeeMembers : committeePreview;
  const impactStats = settings?.impactStats;
  const impactItems = [
    { label: "Active members", value: impactStats?.activeMembers ?? 500 },
    { label: "Events delivered", value: impactStats?.eventsDelivered ?? 35 },
    { label: "Projects shipped", value: impactStats?.projectsShipped ?? 20 },
    { label: "Mentors and seniors", value: impactStats?.mentorsAndSeniors ?? 12 },
  ];

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow={`About ${organizationName}`}
          title={`Learn how ${organizationName} creates practical growth, strong teamwork, and a visible campus tech culture.`}
          description="This page goes beyond the landing overview and explains the club story, mission, working style, leadership structure, and community impact."
          actions={
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap lg:flex-nowrap">
              <Link href="/apply" className="primary-button h-12 w-full whitespace-nowrap px-6 text-sm sm:w-auto">
                Join the Club
              </Link>
              <Link href="/committee" className="secondary-button h-12 w-full whitespace-nowrap px-6 text-sm sm:w-auto">
                See Committee
              </Link>
            </div>
          }
        />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <SectionWrapper
            title="Club story"
            description="Why the club exists and what kind of environment it is trying to build for students."
          >
            <div className="space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
              <p>{aboutStory}</p>
              <p>
                The club is designed to move students from passive interest into real participation through consistent sessions, collaborative events, structured projects, and responsible leadership.
              </p>
            </div>
          </SectionWrapper>

          <MotionReveal className="h-full">
            <div className="h-full overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white/60 p-3 shadow-[0_24px_60px_rgba(8,39,90,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,90,0.12)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                <Image
                  src={aboutSectionPhotoUrl}
                  alt={`${organizationName} about section photo`}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,22,49,0.02),rgba(8,22,49,0.26))]" />
              </div>
            </div>
          </MotionReveal>
        </section>

        <SectionWrapper
          title="Mission and vision"
          description="Clear intent matters. This is how the club defines its work today and where it wants to go next."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MotionReveal className="h-full"><div className="surface-card h-full rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(8,39,90,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[var(--color-primary-strong)]">Mission</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">{mission}</p>
            </div></MotionReveal>
            <MotionReveal className="h-full"><div className="surface-card h-full rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(8,39,90,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[var(--color-primary-strong)]">Vision</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">{vision}</p>
            </div></MotionReveal>
          </div>
        </SectionWrapper>

        <SectionWrapper
          title="How the club works"
          description="The club is not built around random activity. It runs through organized learning, planning, and execution."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Structured sessions", description: "Weekly learning routines keep members active and accountable.", icon: Layers3 },
              { title: "Event execution", description: "Workshops, talks, and competitions create visible community momentum.", icon: Rocket },
              { title: "Peer collaboration", description: "Students learn faster by working in teams, sharing ideas, and reviewing output.", icon: Users2 },
              { title: "Campus support", description: collaboration, icon: Handshake },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <MotionReveal key={item.title} className="h-full"><div className="h-full rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(8,39,90,0.08)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--color-primary-strong)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
                </div></MotionReveal>
              );
            })}
          </div>
        </SectionWrapper>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SectionWrapper
            className="h-full"
            title="What members experience"
            description="Joining the club should feel valuable in practice, not just in name."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "Hands-on learning through workshops and guided practice",
                "Peer support, team coordination, and collaborative project work",
                "Opportunities to organize events and build leadership confidence",
                "Exposure to mentors, seniors, and active campus tech culture",
              ].map((item) => (
                <MotionReveal key={item} className="h-full"><div className="flex h-full items-center rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 px-5 py-4 text-sm font-medium text-[var(--color-primary-strong)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,39,90,0.08)]">
                  {item}
                </div></MotionReveal>
              ))}
            </div>
          </SectionWrapper>

          <SectionWrapper
            className="h-full"
            title="Community impact"
            description="A healthy club should show activity, continuity, and visible contribution."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {impactItems.map((item) => (
                <MotionReveal key={item.label} className="h-full"><div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5 text-center transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,39,90,0.08)]">
                  <p className="text-3xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{item.value}+</p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{item.label}</p>
                </div></MotionReveal>
              ))}
            </div>
          </SectionWrapper>
        </section>

        <SectionWrapper
          title="Leadership and committee"
          description="The club runs through visible leadership, role ownership, and coordinated execution across the committee."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {committeeMembers.slice(0, 3).map((member) => (
              <CommitteeMemberCard key={`${member.name}-${member.role}`} member={member} />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/committee" className="secondary-button h-12 w-full px-6 text-sm sm:w-auto">
              Explore Full Committee
            </Link>
          </div>
        </SectionWrapper>

        <MotionReveal><section className="surface-card-dark rounded-[2rem] p-6 text-white shadow-[0_28px_70px_rgba(8,22,49,0.2)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(164,233,240,0.72)]">Join {organizationName}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Take part in a student tech community built on action, learning, and teamwork.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(226,232,240,0.8)] sm:text-base">
            If you want structured growth, real event experience, collaborative projects, and an active peer network, this is the right place to start.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/apply" className="primary-button h-12 w-full px-6 text-sm sm:w-auto">
              Apply for Membership
            </Link>
            <Link href="/events" className="secondary-button h-12 w-full border-white/14 bg-white/6 px-6 text-sm text-white hover:bg-white/10 hover:text-white sm:w-auto">
              Explore Events
            </Link>
          </div>
        </section></MotionReveal>
      </div>
    </main>
  );
}
