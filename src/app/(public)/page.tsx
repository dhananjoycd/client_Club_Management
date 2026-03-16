export const dynamic = "force-dynamic";

import { HomePageView } from "@/features/home/home-page";
import { eventService } from "@/services/event.service";
import { noticeService } from "@/services/notice.service";
import { settingsService } from "@/services/settings.service";
import { EventItem } from "@/types/event.types";
import { NoticeItem } from "@/types/notice.types";
import { SiteSettings } from "@/types/settings.types";

async function getHomePageData(): Promise<{ settings: SiteSettings | null; featuredEvents: EventItem[]; latestNotices: NoticeItem[] }> {
  const [settingsResult, eventsResult, noticesResult] = await Promise.allSettled([
    settingsService.getSettings(),
    eventService.getEvents({ limit: 3 }),
    noticeService.getNotices({ limit: 10 }),
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

  return { settings, featuredEvents, latestNotices };
}

export default async function HomePage() {
  const { settings, featuredEvents, latestNotices } = await getHomePageData();

  return <HomePageView settings={settings} featuredEvents={featuredEvents} latestNotices={latestNotices} />;
}
