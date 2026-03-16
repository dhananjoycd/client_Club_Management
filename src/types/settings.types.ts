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

export type SiteFaqItem = {
  question: string;
  answer: string;
};

export type SiteTestimonial = {
  quote: string;
  author: string;
  meta: string;
};

export type SiteCommitteeMember = {
  name: string;
  role: string;
  department: string;
  bio?: string;
  photoUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  email?: string;
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
  faqs?: SiteFaqItem[] | null;
  testimonials?: SiteTestimonial[] | null;
  committeeMembers?: SiteCommitteeMember[] | null;
  committeeGroupPhotoUrl?: string | null;
  aboutSectionPhotoUrl?: string | null;
  aboutText?: string | null;
  aboutMission?: string | null;
  aboutVision?: string | null;
  aboutCollaboration?: string | null;
};
