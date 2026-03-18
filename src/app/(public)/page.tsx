export const dynamic = "force-dynamic";

import { HomePageView } from "@/features/home/home-page";
import { committeeService } from "@/services/committee.service";
import { eventService } from "@/services/event.service";
import { noticeService } from "@/services/notice.service";
import { settingsService } from "@/services/settings.service";
import { testimonialService } from "@/services/testimonial.service";
import { EventItem } from "@/types/event.types";
import { NoticeItem } from "@/types/notice.types";
import { SiteSettings } from "@/types/settings.types";

async function getHomePageData(): Promise<{ settings: SiteSettings | null; featuredEvents: EventItem[]; latestNotices: NoticeItem[]; testimonials: any[]; committeeMembers: any[] }> {
  const [settingsResult, eventsResult, noticesResult, testimonialsResult, committeeResult] = await Promise.allSettled([
    settingsService.getSettings(),
    eventService.getEvents({ limit: 3 }),
    noticeService.getNotices({ limit: 10 }),
    testimonialService.getPublicTestimonials(),
    committeeService.getPublicCommittee(),
  ]);

  const settings = settingsResult.status === "fulfilled" ? settingsResult.value.data : null;
  const featuredEvents =
    eventsResult.status === "fulfilled"
      ? eventsResult.value.data?.result?.slice(0, 3) ?? []
      : [];
  const latestNotices =
    noticesResult.status === "fulfilled"
      ? [...(noticesResult.value.data?.result ?? [])]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2)
      : [];

  const testimonials = testimonialsResult.status === "fulfilled" ? testimonialsResult.value.data ?? [] : [];
  const committeeMembers = committeeResult.status === "fulfilled" ? committeeResult.value.data?.activeSession?.assignments ?? [] : [];

  return { settings, featuredEvents, latestNotices, testimonials, committeeMembers };
}

export default async function HomePage() {
  const { settings, featuredEvents, latestNotices, testimonials, committeeMembers } = await getHomePageData();

  return <HomePageView settings={settings} featuredEvents={featuredEvents} latestNotices={latestNotices} testimonials={testimonials} committeeMembers={committeeMembers} />;
}
