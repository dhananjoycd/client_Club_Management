export type SiteSettings = {
  id?: string;
  organizationName: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  socialLinks?: Record<string, string> | null;
  aboutText?: string | null;
};
