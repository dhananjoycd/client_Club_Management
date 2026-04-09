import { AiAssistantLink } from "@/lib/ai/types";

export type KnowledgeSection = {
  id: string;
  title: string;
  body: string;
  keywords: string[];
  links: AiAssistantLink[];
};

export const aiQuickPrompts = [
  "What events are coming up?",
  "Who leads the club right now?",
  "How do I apply for membership?",
  "What can event managers do?",
  "How do I contact the admin team?",
  "Tell me about the committee roles",
  "What is XYZ Tech Club about?",
];

export const knowledgeSections: KnowledgeSection[] = [
  {
    id: "events",
    title: "Event registration",
    body: "Public users can browse events from the events page. Free events can be registered directly, while paid events redirect the user to Stripe checkout. If a profile is incomplete, the user must finish their account profile before registering. When an event reaches capacity, the registration flow can place the user on the waitlist instead.",
    keywords: [
      "event",
      "events",
      "register",
      "registration",
      "paid",
      "free",
      "stripe",
      "waitlist",
      "capacity",
      "profile",
    ],
    links: [
      { label: "Browse events", href: "/events" },
      { label: "Open my registrations", href: "/account/registrations" },
      { label: "Complete profile", href: "/account/profile" },
    ],
  },
  {
    id: "membership",
    title: "Membership application",
    body: "Users can apply for club membership from the apply page. Existing members, admins, super admins, and event managers do not need to submit the membership application form again. The account profile should be complete before applying so the application contains all required academic and personal details.",
    keywords: [
      "membership",
      "member",
      "apply",
      "application",
      "join",
      "club",
      "profile",
    ],
    links: [
      { label: "Apply for membership", href: "/apply" },
      { label: "Update profile", href: "/account/profile" },
      { label: "Check membership status", href: "/account/membership-status" },
    ],
  },
  {
    id: "notices",
    title: "Notices and announcements",
    body: "Club notices are available from the notices page for signed-in users. The notice area supports search by title and content, and the backend decides which notices are visible based on account access. Users should sign in to review the latest official announcements relevant to their role.",
    keywords: [
      "notice",
      "notices",
      "announcement",
      "announcements",
      "search",
      "signin",
      "role",
    ],
    links: [
      { label: "Open notices", href: "/notices" },
      { label: "Login", href: "/login" },
    ],
  },
  {
    id: "contact",
    title: "Support and contact",
    body: "Signed-in users can send structured contact requests from the contact page. Each message stays attached to the account, and admins or super admins can review the request, add an admin note, and mark it as resolved. The contact page also shows the latest resolved admin note when available.",
    keywords: [
      "contact",
      "support",
      "message",
      "admin note",
      "resolved",
      "help",
    ],
    links: [
      { label: "Contact page", href: "/contact" },
      { label: "Login", href: "/login" },
    ],
  },
  {
    id: "committee",
    title: "Committee and leadership",
    body: "The committee page presents the current leadership and role assignments for XYZ Tech Club. You can review position details, department context, and public profile information from the committee section.",
    keywords: [
      "committee",
      "leadership",
      "president",
      "secretary",
      "convener",
      "roles",
      "team",
      "club committee",
    ],
    links: [
      { label: "Open committee page", href: "/committee" },
      { label: "About XYZ Club", href: "/about" },
    ],
  },
  {
    id: "event-manager",
    title: "Event manager access",
    body: "Event managers use the admin workspace for event operations, but their main landing area is the events dashboard rather than the global admin overview. They can work with events, payments, notices, and profile pages that allow the EVENT_MANAGER role. This is different from full admins, who also manage users, applications, and site-wide settings.",
    keywords: [
      "event manager",
      "manager",
      "event_manager",
      "dashboard",
      "admin",
      "payments",
      "notices",
      "profile",
      "access",
    ],
    links: [
      { label: "Event dashboard", href: "/admin/events" },
      { label: "Payments dashboard", href: "/admin/payments" },
      { label: "Admin profile", href: "/admin/profile" },
    ],
  },
];
