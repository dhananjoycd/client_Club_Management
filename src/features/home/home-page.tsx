"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BellRing, CalendarDays, ChevronRight, LayoutDashboard, Mail, MapPin, Phone, ShieldCheck, Sparkles, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { CountUpNumber } from "@/components/motion/count-up-number";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import {
  activityItems,
  benefitItems,
  faqItems,
  committeePreview,
} from "@/features/home/home-content";
import { EventItem } from "@/types/event.types";
import { NoticeItem } from "@/types/notice.types";
import { truncateText } from "@/lib/text";
import { CommitteeDisplayMember } from "@/types/committee.types";
import { SiteFaqItem, SiteImpactStats, SiteSettings } from "@/types/settings.types";
import { PublicTestimonial } from "@/types/testimonial.types";

type HomePageViewProps = {
  settings: SiteSettings | null;
  featuredEvents: EventItem[];
  latestNotices: NoticeItem[];
  testimonials: PublicTestimonial[];
  committeeMembers: CommitteeDisplayMember[];
};

type HeroSlide = {
  title: string;
  description: string;
  image: string;
  tag: string;
};

const trustItems = ["Student community", "Workshop-led learning", "Project-based collaboration", "Event-driven growth"];
const HOME_POPUP_VERSION = "1.0.0";
const HOME_POPUP_STORAGE_KEY = `homepage-popup-seen-v${HOME_POPUP_VERSION}`;

const homePopupFeatures = [
  { icon: CalendarDays, text: "Explore upcoming club events" },
  { icon: UserPlus, text: "Apply for membership online" },
  { icon: BellRing, text: "Read notices and announcements" },
  { icon: Users, text: "Manage profile and registrations" },
  { icon: LayoutDashboard, text: "Access role-based admin and member dashboards" },
];

const defaultCommitteeGroupPhotoUrl = "https://media.istockphoto.com/id/1400051391/photo/portrait-of-successful-team-at-the-office.jpg?s=612x612&w=0&k=20&c=-JPTGPOpKyIgvFymzYRg1XecuUJsXgdY0k5DeDMBi30=";
const defaultAboutSectionPhotoUrl = "https://www.faulkner.edu/wp-content/uploads/college-students-working-on-a-group-project-Faulkner-University.jpg";

const defaultImpactStats: Required<SiteImpactStats> = {
  activeMembers: 500,
  eventsDelivered: 35,
  projectsShipped: 20,
  mentorsAndSeniors: 12,
};

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const defaultHeroSlides: HeroSlide[] = [
  {
    title: "Coding Team Sprint",
    description: "Collaborative product build review with live coding, feedback, and rapid iteration.",
    image: "/hero/coding-team.svg",
    tag: "Coding team",
  },
  {
    title: "Campus Lab Session",
    description: "A practical environment for workshops, experimentation, and guided technical practice.",
    image: "/hero/campus-lab.svg",
    tag: "Campus lab",
  },
  {
    title: "Collaboration Scene",
    description: "Planning, discussion, and peer execution across teams and project groups.",
    image: "/hero/collaboration-scene.svg",
    tag: "Teamwork",
  },
];

export function HomePageView({ settings, featuredEvents, latestNotices, testimonials, committeeMembers }: HomePageViewProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const organizationName = settings?.organizationName?.trim() || "XYZ Tech Club";
  const aboutText =
    settings?.aboutText?.trim() ||
    `${organizationName} is a student-led technology community where students learn, build, collaborate, and contribute through workshops, events, and project-driven activity.`;
  const email = settings?.contactEmail?.trim() || "hello@xyztechclub.org";
  const phone = settings?.phone?.trim() || "+880 1234-567890";
  const configLinks = settings?.socialLinks ?? {};
  const configuredHeroSlides = settings?.heroSlides ?? [];
  const configuredImpactStats = settings?.impactStats ?? {};
  const configuredFaqs = settings?.faqs ?? [];
  const committeeGroupPhotoUrl = defaultCommitteeGroupPhotoUrl;
  const aboutSectionPhotoUrl = settings?.aboutSectionPhotoUrl?.trim() || defaultAboutSectionPhotoUrl;
  const heroSlides = defaultHeroSlides.map((slide, index) => ({
    ...slide,
    image: configuredHeroSlides[index]?.image?.trim() || configLinks[`heroSlide${index + 1}Image`]?.trim() || slide.image,
    title: configuredHeroSlides[index]?.title?.trim() || configLinks[`heroSlide${index + 1}Title`]?.trim() || slide.title,
    description: configuredHeroSlides[index]?.description?.trim() || configLinks[`heroSlide${index + 1}Description`]?.trim() || slide.description,
    tag: configuredHeroSlides[index]?.tag?.trim() || slide.tag,
  }));
  const displayFaqs: SiteFaqItem[] = configuredFaqs.length > 0 ? configuredFaqs : faqItems;
  const displayTestimonials = testimonials.slice(0, 3).map((item) => ({ ...item, author: item.authorName }));
  const displayCommitteeMembers = committeeMembers.length > 0 ? committeeMembers : committeePreview;
  const impactStats = [
    {
      label: "Active members",
      value: configuredImpactStats.activeMembers ?? defaultImpactStats.activeMembers,
      suffix: "+",
    },
    {
      label: "Events delivered",
      value: configuredImpactStats.eventsDelivered ?? defaultImpactStats.eventsDelivered,
      suffix: "+",
    },
    {
      label: "Projects shipped",
      value: configuredImpactStats.projectsShipped ?? defaultImpactStats.projectsShipped,
      suffix: "+",
    },
    {
      label: "Mentors and seniors",
      value: configuredImpactStats.mentorsAndSeniors ?? defaultImpactStats.mentorsAndSeniors,
      suffix: "+",
    },
  ];
  const marqueeItems = latestNotices.length > 0
    ? latestNotices.map((notice) => `${notice.title}: ${notice.content}`)
    : [
        "Member intake is open now.",
        "Featured events update automatically from the backend.",
      ];
  const marqueeLoop = [...marqueeItems, ...marqueeItems];

  useEffect(() => {
    const hasSeenPopup = window.localStorage.getItem(HOME_POPUP_STORAGE_KEY);

    if (!hasSeenPopup) {
      setShowWelcomePopup(true);
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!showWelcomePopup) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showWelcomePopup]);

  const dismissWelcomePopup = () => {
    window.localStorage.setItem(HOME_POPUP_STORAGE_KEY, "true");
    setShowWelcomePopup(false);
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <>
      {showWelcomePopup ? (
        <div className="fixed inset-0 z-[120] overflow-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="home-welcome-popup-title">
          <div className="relative mx-auto my-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[rgba(125,211,252,0.24)] bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(240,249,255,0.98))] shadow-[0_30px_80px_rgba(8,39,90,0.28)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(15,76,189,0.12),transparent_24%)]" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,165,233,0.18)] bg-[rgba(14,165,233,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    What&apos;s new
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 id="home-welcome-popup-title" className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">Welcome to XYZ Tech Club</h2>
                    <span className="inline-flex items-center gap-2 rounded-full app-card-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Version {HOME_POPUP_VERSION}
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">What you can do in Version {HOME_POPUP_VERSION}</p>
                </div>
                <button
                  type="button"
                  onClick={dismissWelcomePopup}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl app-card-subtle text-[var(--color-primary)] transition hover:border-[var(--color-accent)] hover:bg-white"
                  aria-label="Close welcome popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {homePopupFeatures.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.text} className="flex items-start gap-3 rounded-[1.25rem] app-card-soft px-4 py-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-primary-strong)] sm:text-[15px]">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--color-muted-foreground)]">This message appears only on your first visit.</p>
                <button type="button" onClick={dismissWelcomePopup} className="primary-button inline-flex h-11 items-center gap-2 px-5 text-sm">
                  Explore now
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main className="text-[var(--color-foreground)]">
      <section className="border-b border-[rgba(14,165,183,0.22)] bg-[linear-gradient(90deg,#0b2f6f,#0f4cbd,#0ea5b7)] text-white shadow-[0_10px_30px_rgba(15,76,189,0.18)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full border border-white/18 bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              Latest Notices
            </span>
          </div>
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div className="announcement-marquee-track flex min-w-max items-center gap-8 pr-8">
              {marqueeLoop.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-8 text-sm text-white/92">
                  <span className="whitespace-nowrap font-medium">{item}</span>
                  <span className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.72)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,199,214,0.14),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(15,76,189,0.1),transparent_24%)]"
          animate={{ opacity: [0.8, 1, 0.82] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[12%] top-[14%] hidden h-44 w-44 rounded-full bg-[rgba(34,199,214,0.12)] blur-3xl lg:block"
          animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[8%] top-[18%] hidden h-56 w-56 rounded-full bg-[rgba(15,76,189,0.12)] blur-3xl lg:block"
          animate={{ y: [0, 16, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-20">
          <motion.div
            className="relative z-10 flex flex-col justify-center gap-8"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={heroItemVariants} className="space-y-5">
              <span className="surface-card inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-secondary)]">
                <Sparkles className="h-4 w-4" />
                Tech community platform
              </span>
              <div className="space-y-4">
                <motion.p variants={heroItemVariants} className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-secondary)]">{organizationName}</motion.p>
                <motion.h1 variants={heroItemVariants} className="max-w-3xl text-3xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-5xl lg:text-[3.9rem] lg:leading-[0.98]">
                  XYZ Tech Club Portal
                </motion.h1>
              </div>
              <motion.p variants={heroItemVariants} className="max-w-2xl text-base leading-8 text-[var(--color-muted-foreground)] sm:text-lg">
                A streamlined platform for managing members, events, notices, applications, and the day-to-day rhythm of club operations.
              </motion.p>
            </motion.div>

            <motion.div variants={heroItemVariants} className="flex flex-col gap-3 sm:flex-row">
              <MembershipApplyCta
                label="Join the Club"
                className="primary-button h-12 px-6 text-sm"
              />
              <Link href="/events" className="secondary-button h-12 px-6 text-sm">
                Explore Events
              </Link>
            </motion.div>

            <motion.div variants={heroContainerVariants} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {impactStats.map((item) => (
                <motion.div
                  key={item.label}
                  variants={heroItemVariants}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="surface-card rounded-[1.5rem] p-4"
                >
                  <p className="text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-3xl">
                    <CountUpNumber value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, x: 36, y: 18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <motion.div className="surface-card grid grid-cols-1 gap-4 rounded-[2rem] p-3 sm:grid-cols-2 sm:p-6" animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_48px_rgba(15,76,189,0.18)] sm:col-span-2">
                <div className="relative aspect-[16/10] min-h-[280px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentSlide.image}-${activeSlide}`}
                      initial={{ opacity: 0, scale: 1.04, x: 18 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98, x: -18 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image src={currentSlide.image} alt={currentSlide.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" priority={activeSlide === 0} />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,22,49,0.12),rgba(8,22,49,0.68))]" />
                  <motion.div
                    key={`${currentSlide.title}-content`}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                    className="absolute inset-x-0 bottom-0 p-4 sm:p-6"
                  >
                    <span className="inline-flex rounded-full border border-white/16 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/88">
                      {currentSlide.tag}
                    </span>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">{currentSlide.title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 sm:leading-7">{currentSlide.description}</p>
                  </motion.div>
                </div>
                <div className="absolute left-4 top-4 flex gap-2">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/46 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    aria-label="Previous slide"
                    onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white backdrop-blur transition hover:bg-white/18"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    aria-label="Next slide"
                    onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white backdrop-blur transition hover:bg-white/18"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} className="h-full">
                <StatCard className="h-full"
                  label="Weekly sessions"
                  value="Every Friday"
                  description="Consistent learning routines keep members active throughout the semester."
                  icon={<CalendarDays className="h-5 w-5" />}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38, ease: "easeOut" }} className="h-full">
                <StatCard className="h-full"
                  label="Community growth"
                  value="Peer-led"
                  description="Mentorship, collaboration, and leadership create stronger member retention."
                  icon={<Users className="h-5 w-5" />}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.46, ease: "easeOut" }} className="rounded-[1.5rem] app-card-soft p-5 sm:col-span-2 dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(12,27,43,0.94),rgba(8,19,32,0.98))]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Why it works</p>
                <ul className="mt-4 grid grid-cols-1 gap-3 text-sm leading-6 text-[var(--color-foreground)] sm:grid-cols-2 dark:text-[var(--color-primary-strong)]">
                  {trustItems.map((item) => (
                    <motion.li key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex items-start gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-white/58 backdrop-blur dark:bg-[linear-gradient(180deg,rgba(12,27,43,0.94),rgba(8,19,32,0.98))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">Trusted campus collaboration</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-accent)]">
            <span>University community</span>
            <span>Student leaders</span>
            <span>Workshop mentors</span>
            <span>Event collaborators</span>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(125,211,252,0.22)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.24)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,199,214,0.16),transparent_22%)]" />
            <div className="relative">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(214,240,255,0.82)]">About XYZ Tech Club</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">A student technology community built around learning, events, teamwork, and visible contribution.</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[rgba(236,244,255,0.88)]">{aboutText || "XYZ Tech Club helps students learn practical skills, join workshops, participate in events, collaborate on projects, and grow through an active campus tech community."}</p>
              {aboutSectionPhotoUrl ? (
                <motion.div
                  className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/14 bg-white/8 shadow-[0_18px_40px_rgba(7,16,32,0.2)] dark:bg-white/10"
                  animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={aboutSectionPhotoUrl}
                      alt={`${organizationName} about section photo`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 32vw"
                      unoptimized
                    />
                  </div>
                </motion.div>
              ) : null}
              <Link href="/about" className="secondary-button mt-6 inline-flex h-11 items-center gap-2 self-start border-white/18 bg-white/12 px-5 text-sm text-white shadow-[0_16px_36px_rgba(8,39,90,0.22)] backdrop-blur hover:border-white/26 hover:bg-white/18 hover:text-white">
                Learn more about XYZ Tech Club
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <SectionWrapper
            title="What members actually do"
            description="The club is built around visible work, regular participation, and practical growth across the academic year."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activityItems.slice(0, 4).map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.5rem] app-card p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(14,30,47,0.94),rgba(10,22,36,0.98))] dark:shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
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
                <div key={item.title} className="rounded-[1.5rem] app-card p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(14,30,47,0.94),rgba(10,22,36,0.98))] dark:shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
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
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">
                  A strong club should create consistent learning, responsible teamwork, and a clear path from first participation to real contribution.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl app-card px-4 py-3 text-sm font-medium text-[var(--color-primary-strong)] dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(14,30,47,0.94),rgba(10,22,36,0.98))]">Weekly sessions and workshops</div>
                  <div className="rounded-2xl app-card px-4 py-3 text-sm font-medium text-[var(--color-primary-strong)] dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(14,30,47,0.94),rgba(10,22,36,0.98))]">Projects, teamwork, and mentorship</div>
                </div>
              </div>
              <MembershipApplyCta
                label="Apply for membership"
                className="primary-button inline-flex h-11 items-center gap-2 self-start px-5 text-sm"
              />
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
                <article key={event.id} className="rounded-[1.75rem] app-card p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm dark:border-[rgba(148,163,184,0.22)] dark:bg-[linear-gradient(180deg,rgba(14,30,47,0.94),rgba(10,22,36,0.98))] dark:shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">
                      Upcoming
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">{format(new Date(event.eventDate), "dd MMM yyyy")}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{event.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{truncateText(event.description, 60)}</p>
                  <div className="mt-5 space-y-2 text-sm text-[var(--color-muted-foreground)]">
                    <p>
                      <span className="font-medium text-[var(--color-primary-strong)]">Location:</span> {event.location}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--color-primary-strong)]">Capacity:</span> {event.capacity}
                    </p>
                  </div>
                  <div className="mt-5">
                    <Link href={`/events/${event.id}`} className="secondary-button inline-flex h-10 items-center gap-2 px-4 text-sm">
                      Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border)] app-card-soft p-8 lg:col-span-3 dark:bg-[rgba(12,26,41,0.72)]">
                <h3 className="text-lg font-semibold text-[var(--color-primary-strong)]">Featured events will appear here</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted-foreground)]">
                  Once event data is published from the admin dashboard, this section will automatically show the latest upcoming sessions.
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/events" className="primary-button inline-flex h-11 items-center gap-2 px-5 text-sm">
              View all events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionWrapper>

        <SectionWrapper
          title="Testimonials"
          description="Real feedback from members, participants, and mentors helps visitors trust the club much faster."
        >
          {displayTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(125,211,252,0.26)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.2)] sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,199,214,0.18),transparent_26%)]" />
                <div className="relative flex h-full flex-col gap-6">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(214,240,255,0.82)]">Member voices</p>
                    <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                      &ldquo;{displayTestimonials[0]?.quote}&rdquo;
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-white">{displayTestimonials[0]?.author}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(214,240,255,0.78)]">{displayTestimonials[0]?.meta}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {displayTestimonials.slice(1).map((item) => (
                  <article key={item.id} className="surface-card flex h-full flex-col justify-between rounded-[1.75rem] p-5 sm:p-6">
                    <p className="text-sm leading-7 text-[var(--color-foreground)] sm:text-base">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                      <p className="text-sm font-semibold text-[var(--color-primary-strong)]">{item.author}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{item.meta}</p>
                    </div>
                  </article>
                ))}
                <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border)] app-card-soft p-5 sm:p-6 md:col-span-2 dark:bg-[rgba(12,26,41,0.72)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Why this matters</p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
                    Testimonials give social proof. They help new visitors understand that XYZ Tech Club is active, useful, and trusted by real students and mentors.
                  </p>
                  <Link href="/testimonials" className="secondary-button mt-5 inline-flex h-11 items-center gap-2 px-5 text-sm">
                    See All Testimonials
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border)] app-card-soft p-6 sm:p-8 dark:bg-[rgba(12,26,41,0.72)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Approved testimonials</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
                This section will update automatically once admins approve the first community testimonial submission.
              </p>
              <Link href="/testimonials" className="secondary-button mt-5 inline-flex h-11 items-center gap-2 px-5 text-sm">
                Open Testimonials Page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </SectionWrapper>

        <section id="committee" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(125,211,252,0.22)] bg-[linear-gradient(145deg,#08275a_0%,#0b3b88_52%,#0ea5b7_100%)] p-6 text-white shadow-[0_24px_60px_rgba(8,39,90,0.24)] sm:p-8 lg:order-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,199,214,0.14),transparent_24%)]" />
              <div className="relative flex h-full flex-col gap-6">
                <div className="max-w-xl space-y-4">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-[rgba(214,240,255,0.82)]">Club Leadership</p>
                  <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.35rem] sm:leading-[1.08]">Meet the executive team shaping the direction of {organizationName}.</h2>
                  <p className="text-sm leading-7 text-[rgba(236,244,255,0.86)] sm:text-[15px]">From planning flagship events to coordinating members, communication, and operations, this team helps keep {organizationName} active, organized, and moving forward throughout the academic year.</p>
                  <p className="text-sm leading-7 text-[rgba(214,240,255,0.72)]">Each role contributes to building a stronger club culture rooted in collaboration, consistency, and meaningful student engagement.</p>
                </div>
                <motion.div
                  className="relative overflow-hidden rounded-[1.5rem] border border-white/14 bg-white/8 shadow-[0_18px_40px_rgba(7,16,32,0.2)] dark:bg-white/10"
                  animate={{ y: [0, -8, 0], scale: [1, 1.015, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={committeeGroupPhotoUrl}
                      alt={`${organizationName} committee group photo`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 32vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,40,0.02),rgba(6,18,40,0.22))]" />
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-2">
              {displayCommitteeMembers.slice(0, 4).map((member) => (
                <CommitteeMemberCard key={`${member.name}-${member.role}`} member={member} compact />
              ))}
            </div>
          </div>

          <div className="flex w-full justify-center">
            <Link href="/committee" className="inline-flex h-12 w-full max-w-lg items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-6 text-sm font-semibold tracking-[0.01em] text-[var(--color-primary-strong)] shadow-[0_16px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(14,165,233,0.3)] hover:text-[var(--color-secondary)] hover:shadow-[0_20px_38px_rgba(15,23,42,0.1)] dark:border-[rgba(148,163,184,0.26)] dark:bg-[linear-gradient(180deg,rgba(15,31,48,0.98),rgba(10,22,36,1))] dark:text-[var(--color-primary-strong)] dark:shadow-[0_18px_42px_rgba(2,8,23,0.28)] dark:hover:border-[rgba(79,225,233,0.38)] dark:hover:bg-[linear-gradient(180deg,rgba(18,38,58,1),rgba(12,27,43,1))] dark:hover:text-[var(--color-accent)]">
              Meet the Full Leadership Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionWrapper
            title="Frequently asked questions"
            description="FAQ helps reduce hesitation before applying and removes common uncertainty quickly."
          >
            <FaqAccordion items={displayFaqs} />
          </SectionWrapper>

          <div className="space-y-6">
            <section className="surface-card-dark rounded-[2rem] p-6 text-white sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(164,233,240,0.72)]">Ready to join?</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Become part of a growing student technology community.</h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(226,232,240,0.78)]">
                Apply for membership, follow upcoming activities, and connect with a club culture built around action, learning, and teamwork.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <MembershipApplyCta
                  label="Apply for Membership"
                  className="primary-button h-11 px-5 text-sm"
                />
                <Link href="#contact" className="secondary-button h-11 border-white/14 bg-white/6 px-5 text-sm text-white hover:bg-white/10 hover:text-white">
                  Contact Us
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}


































