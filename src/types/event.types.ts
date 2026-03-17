import { RegistrationStatus } from "@/types/registration.types";

export const eventCategories = ["Workshop", "Seminar", "Webinar", "Hackathon", "Competition", "Tech Talk", "Bootcamp", "Meetup"] as const;
export type EventCategory = (typeof eventCategories)[number];
export type EventType = "FREE" | "PAID";

export type EventCreator = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

export type EventRegistrationSummary = {
  id: string;
  status: RegistrationStatus;
  registeredAt?: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  capacity: number;
  category?: EventCategory | null;
  eventType?: EventType;
  price?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isRegistrationOpen?: boolean;
  creator?: EventCreator;
  registrations?: EventRegistrationSummary[];
  _count?: {
    registrations: number;
  };
};
