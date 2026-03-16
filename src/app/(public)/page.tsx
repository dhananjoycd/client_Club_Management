export const dynamic = "force-dynamic";

import { HomePageView } from "@/features/home/home-page";
import { eventService } from "@/services/event.service";
import { settingsService } from "@/services/settings.service";
import { EventItem } from "@/types/event.types";
import { SiteSettings } from "@/types/settings.types";

async function getHomePageData(): Promise<{ settings: SiteSettings | null; featuredEvents: EventItem[] }> {
  const [settingsResult, eventsResult] = await Promise.allSettled([
    settingsService.getSettings(),
    eventService.getEvents({ limit: 3 }),
  ]);

  const settings = settingsResult.status === "fulfilled" ? settingsResult.value.data : null;
  const featuredEvents =
    eventsResult.status === "fulfilled"
      ? eventsResult.value.data?.result?.slice(0, 3) ?? []
      : [];

  return { settings, featuredEvents };
}

export default async function HomePage() {
  const { settings, featuredEvents } = await getHomePageData();

  return <HomePageView settings={settings} featuredEvents={featuredEvents} />;
}


