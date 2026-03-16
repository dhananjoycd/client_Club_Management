export type SiteHeroSlide = {
  image: string;
  title: string;
  description: string;
  tag?: string;
};

export type SiteImpactStats = {
  activeMembers?: number;
  eventsDelivered?: number;
  projectsShipped?: number;
  mentorsAndSeniors?: number;
};

export type SiteSettings = {
  id?: string;
  organizationName: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  socialLinks?: Record<string, string> | null;
  heroSlides?: SiteHeroSlide[] | null;
  impactStats?: SiteImpactStats | null;
  aboutText?: string | null;
};
