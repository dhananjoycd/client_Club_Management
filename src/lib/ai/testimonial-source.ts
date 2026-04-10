import { AiTestimonialSnapshotItem } from "@/lib/ai/types";
import { PublicTestimonial } from "@/types/testimonial.types";

type TestimonialsResponseShape = {
  data?: PublicTestimonial[] | null;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.trim();
}

export async function getAiTestimonialsSnapshot(): Promise<
  AiTestimonialSnapshotItem[]
> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const response = await fetch(`${baseUrl}/testimonials`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load testimonials for AI: ${response.status}`);
  }

  const payload = (await response.json()) as TestimonialsResponseShape;
  return (payload?.data ?? [])
    .filter((item) => item?.authorName?.trim() && item?.quote?.trim())
    .map((item) => ({
      authorName: item.authorName.trim(),
      quote: item.quote.trim(),
      meta: item.meta?.trim() || "Community member",
      isFeatured: item.isFeatured,
    }))
    .slice(0, 6);
}
