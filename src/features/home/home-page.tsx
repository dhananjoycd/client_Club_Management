import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, ChevronRight, Mail, MapPin, Phone, Sparkles, Users } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { SiteSettings } from "@/types/settings.types";
import { EventItem } from "@/types/event.types";
import {
  activityItems,
  announcementItems,
  benefitItems,
  faqItems,
  teamPreview,
  testimonialItems,
} from "@/features/home/home-content";

type HomePageViewProps = {
  settings: SiteSettings | null;
  featuredEvents: EventItem[];
};

const trustItems = ["Student community", "Workshop-led learning", "Project-based collaboration", "Event-driven growth"];

const impactStats = [
  { label: "Active members", value: "500+" },
  { label: "Events delivered", value: "35+" },
  { label: "Projects shipped", value: "20+" },
  { label: "Mentors and seniors", value: "12+" },
];

export function HomePageView({ settings, featuredEvents }: HomePageViewProps) {
  const organizationName = settings?.organizationName?.trim() || "XYZ Tech Club";
  const aboutText =
    settings?.aboutText?.trim() ||
    `${organizationName} is a student-led technology community focused on practical learning, collaborative execution, and building a stronger campus tech culture.`;
  const email = settings?.contactEmail?.trim() || "hello@xyztechclub.org";
  const phone = settings?.phone?.trim() || "+880 1234-567890";

  return (
    <main className="text-[var(--color-foreground)]">
      <section className="border-b border-[var(--color-border)] bg-white/52 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-3 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="surface-card rounded-full px-3 py-1 font-semibold text-[var(--color-primary-strong)]">Announcement</span>
            <span className="text-[var(--color-muted-foreground)]">{announcementItems[0]}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[var(--color-muted-foreground)]">
            {announcementItems.slice(1).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,199,214,0.14),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(15,76,189,0.1),transparent_24%)]" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-20">
          <div className="relative z-10 flex flex-col justify-center gap-8">
            <div className="space-y-5">
              <span className="surface-card inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-secondary)]">
                <Sparkles className="h-4 w-4" />
                Tech community platform
              </span>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-secondary)]">{organizationName}</p>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-5xl lg:text-[4.5rem] lg:leading-[0.95]">
                  Build skills, run events, and grow a stronger student community.
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-8 text-[var(--color-muted-foreground)] sm:text-lg">
                A polished club portal for workshops, announcements, applications, and member engagement. Clear, modern, and built for active campus communities.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/apply" className="primary-button h-12 px-6 text-sm">
                Join the Club
              </Link>
              <Link href="/events" className="secondary-button h-12 px-6 text-sm">
                Explore Events
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {impactStats.map((item) => (
                <div key={item.label} className="surface-card rounded-[1.5rem] p-4">
                  <p className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{item.value}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="surface-card grid gap-4 rounded-[2rem] p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,var(--color-primary-strong),var(--color-primary))] p-6 text-white shadow-[0_24px_48px_rgba(15,76,189,0.22)] sm:col-span-2">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/66">Club snapshot</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">{organizationName}</h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/78">
                  A focused digital home for student clubs that need clear communication, structured activity, and a professional public presence.
                </p>
              </div>
              <StatCard
                label="Weekly sessions"
                value="Every Friday"
                description="Consistent learning routines keep members active throughout the semester."
                icon={<CalendarDays className="h-5 w-5" />}
              />
              <StatCard
                label="Community growth"
                value="Peer-led"
                description="Mentorship, collaboration, and leadership create stronger member retention."
                icon={<Users className="h-5 w-5" />}
              />
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#eff7ff,#f8fcff)] p-5 sm:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Why it works</p>
                <ul className="mt-4 grid grid-cols-1 gap-3 text-sm leading-6 text-[var(--color-foreground)] sm:grid-cols-2">
                  {trustItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-white/58 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">Trusted campus collaboration</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-[var(--color-primary)]">
            <span>University community</span>
            <span>Student leaders</span>
            <span>Workshop mentors</span>
            <span>Event collaborators</span>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface-card rounded-[2rem] bg-[linear-gradient(145deg,#0b2f6f,#0f4cbd)] p-6 text-white sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(210,240,255,0.78)]">About the club</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">A focused student community that turns curiosity into execution.</h2>
            <p className="mt-4 text-base leading-8 text-[rgba(235,245,255,0.82)]">{aboutText}</p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]">
              Learn more about the club
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <SectionWrapper
            title="What members actually do"
            description="The club is built around visible work, regular participation, and practical growth across the academic year."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activityItems.slice(0, 4).map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[var(--color-primary-strong)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>
        </section>

        <SectionWrapper
          title="What we do at the club"
          description="Learning, collaboration, competition, and real project work should be clear in one quick scan."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activityItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-primary-strong)]">{item.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </SectionWrapper>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionWrapper
            title={`Why join ${organizationName}?`}
            description="Students stay when the club creates visible growth, useful relationships, and real momentum."
          >
            <div className="space-y-4">
              <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">
                A strong club should do more than collect attendance. It should create consistent activity, responsible leadership, and a path from beginner participation to meaningful contribution.
              </p>
              <Link href="/apply" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                Apply for membership
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefitItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="surface-card rounded-[1.75rem] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--color-primary-strong)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <SectionWrapper
          title="Featured events and workshops"
          description="This section already reads live data from the backend, so the landing page stays active as events are managed from the admin side."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <article key={event.id} className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/60 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">
                      Upcoming
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">{format(new Date(event.eventDate), "dd MMM yyyy")}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{event.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{event.description}</p>
                  <div className="mt-5 space-y-2 text-sm text-[var(--color-muted-foreground)]">
                    <p>
                      <span className="font-medium text-[var(--color-primary-strong)]">Location:</span> {event.location}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--color-primary-strong)]">Capacity:</span> {event.capacity}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-white/60 p-8 lg:col-span-3">
                <h3 className="text-lg font-semibold text-[var(--color-primary-strong)]">Featured events will appear here</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted-foreground)]">
                  Once event data is published from the admin dashboard, this section will automatically show the latest upcoming sessions.
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
              View all events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionWrapper>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SectionWrapper
            title="Impact and momentum"
            description="A strong landing page should show that the club is active, organized, and worth joining."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {impactStats.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5">
                  <p className="text-3xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{item.value}</p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{item.label}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          <SectionWrapper title="Testimonials" description="Short, credible signals from members and participants strengthen trust quickly.">
            <div className="space-y-4">
              {testimonialItems.map((item) => (
                <div key={item.author} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5">
                  <p className="text-sm leading-7 text-[var(--color-foreground)]">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{item.author}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </section>

        <section id="team" className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionWrapper
            title="Executive team preview"
            description="Showing faces and roles adds accountability and makes the organization feel real."
          >
            <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">
              This preview can later be replaced by a fully dynamic committee module, but even a compact section makes the club more trustworthy for visitors and applicants.
            </p>
          </SectionWrapper>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {teamPreview.map((member) => (
              <div key={member.name} className="surface-card rounded-[1.75rem] p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-primary-strong)]">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{member.role}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{member.department}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionWrapper
            title="Frequently asked questions"
            description="FAQ helps reduce hesitation before applying and removes common uncertainty quickly."
          >
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-5">
                  <h3 className="text-base font-semibold text-[var(--color-primary-strong)]">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          <div className="space-y-6">
            <section className="surface-card-dark rounded-[2rem] p-6 text-white sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(164,233,240,0.72)]">Ready to join?</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Become part of a growing student technology community.</h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(226,232,240,0.78)]">
                Apply for membership, follow upcoming activities, and connect with a club culture built around action, learning, and teamwork.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/apply" className="primary-button h-11 px-5 text-sm">
                  Apply for Membership
                </Link>
                <Link href="#contact" className="secondary-button h-11 border-white/14 bg-white/6 px-5 text-sm text-white hover:bg-white/10 hover:text-white">
                  Contact Us
                </Link>
              </div>
            </section>

            <SectionWrapper title="Contact and connect" description="A strong landing page should close with a clear path to communicate.">
              <div id="contact" className="space-y-4 text-sm leading-6 text-[var(--color-muted-foreground)]">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 text-[var(--color-secondary)]" />
                  <span>{email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 text-[var(--color-secondary)]" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-[var(--color-secondary)]" />
                  <span>Main campus activity zone, member and event updates available through the platform.</span>
                </div>
              </div>
            </SectionWrapper>
          </div>
        </section>
      </div>
    </main>
  );
}
