import { getAiAboutSnapshot } from "@/lib/ai/about-source";
import { getAiCommitteeSnapshot } from "@/lib/ai/committee-source";
import { getAiEventCatalog } from "@/lib/ai/event-source";
import {
  generateGeminiAssistantReply,
  isGeminiConfigured,
} from "@/lib/ai/gemini";
import { createLocalAssistantReply } from "@/lib/ai/local";
import { createEventRecommendations } from "@/lib/ai/recommendations";
import { getAiTestimonialsSnapshot } from "@/lib/ai/testimonial-source";
import {
  AiAssistantDynamicContext,
  AiAssistantIntent,
  AiAssistantLink,
  AiAssistantMessage,
  AiAssistantResponse,
} from "@/lib/ai/types";

export const emptyAiAssistantResponse: AiAssistantResponse = {
  answer:
    "Ask a question about events, membership, notices, contact support, or event manager access.",
  relatedLinks: [],
  recommendedEvents: [],
  suggestedPrompts: [],
  mode: "local",
  confidence: "low",
};

const committeeKeywords = [
  "committee",
  "president",
  "secretary",
  "convener",
  "leadership",
  "club team",
  "executive",
];

const intentKeywordMap: Record<AiAssistantIntent, string[]> = {
  about: [
    "about",
    "mission",
    "vision",
    "club story",
    "what is xyz tech club",
    "what the club does",
  ],
  auth: [
    "login",
    "log in",
    "register",
    "sign in",
    "sign up",
    "account create",
    "verify email",
  ],
  committee: committeeKeywords,
  contact: [
    "contact",
    "support",
    "admin team",
    "message admin",
    "help desk",
    "manual support",
  ],
  events: [
    "event",
    "events",
    "register",
    "registration",
    "workshop",
    "seminar",
    "paid event",
    "free event",
    "waitlist",
    "stripe",
  ],
  membership: [
    "membership",
    "member",
    "apply",
    "application",
    "join club",
    "approved",
    "rejected",
    "pending review",
  ],
  notices: ["notice", "notices", "announcement", "announcements"],
  profile: [
    "profile",
    "complete profile",
    "student id",
    "department",
    "session",
    "account dashboard",
  ],
  testimonials: [
    "testimonial",
    "testimonials",
    "feedback",
    "review",
    "quote",
    "community voice",
  ],
};

function detectIntents(message: string): AiAssistantIntent[] {
  const normalized = message.toLowerCase();
  const intents = (
    Object.entries(intentKeywordMap) as Array<[AiAssistantIntent, string[]]>
  )
    .filter(([, keywords]) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    )
    .map(([intent]) => intent);

  if (!intents.length) {
    return ["about", "events", "membership"];
  }

  return intents;
}

function createDynamicSummary(context: AiAssistantDynamicContext) {
  const summary: string[] = [];
  const links: AiAssistantLink[] = [];
  const preferredSectionIds = new Set<string>();

  if (context.intents?.includes("committee")) {
    preferredSectionIds.add("committee");
    links.push({ label: "Open committee page", href: "/committee" });
    if (context.committee?.length) {
      const leadMember =
        context.committee.find((member) =>
          /president|chair|convener|secretary|coordinator/i.test(member.role),
        ) ?? context.committee[0];
      const preview = context.committee
        .slice(0, 4)
        .map(
          (member) =>
            `${member.name} - ${member.role}${member.department ? ` (${member.department})` : ""}`,
        )
        .join("; ");
      summary.push(
        `Current committee snapshot: ${preview}.${leadMember ? ` Main contact lead: ${leadMember.name} (${leadMember.role}).` : ""}`,
      );
    }
  }

  if (context.intents?.includes("testimonials")) {
    preferredSectionIds.add("testimonials");
    links.push({ label: "Open testimonials", href: "/testimonials" });
    if (context.testimonials?.length) {
      const featured =
        context.testimonials.find((item) => item.isFeatured) ??
        context.testimonials[0];
      summary.push(
        `Public testimonials are available on the testimonials page. Example approved feedback: "${featured.quote}" - ${featured.authorName} (${featured.meta}).`,
      );
    }
  }

  if (context.about) {
    if (
      context.intents?.some((intent) =>
        ["about", "contact", "auth", "membership", "profile"].includes(intent),
      )
    ) {
      preferredSectionIds.add("about");
      links.push({ label: "About XYZ Club", href: "/about" });
    }
    if (context.intents?.includes("contact")) {
      preferredSectionIds.add("contact");
      links.push({ label: "Contact page", href: "/contact" });
      if (context.about.contactEmail || context.about.phone) {
        summary.push(
          `Public contact details currently available: ${[
            context.about.contactEmail
              ? `email ${context.about.contactEmail}`
              : null,
            context.about.phone ? `phone ${context.about.phone}` : null,
          ]
            .filter(Boolean)
            .join(", ")}.`,
        );
      }
    }
    if (context.intents?.includes("about")) {
      summary.push(
        `${context.about.organizationName} overview: ${context.about.aboutText ?? context.about.mission ?? "This club focuses on practical student learning, teamwork, and visible campus tech activity."}`,
      );
    }
  }

  if (context.intents?.includes("events")) {
    preferredSectionIds.add("events");
    links.push({ label: "Browse events", href: "/events" });
    links.push({
      label: "Open my registrations",
      href: "/account/registrations",
    });
  }

  if (context.intents?.includes("membership")) {
    preferredSectionIds.add("membership");
    preferredSectionIds.add("membership-status");
    links.push({ label: "Apply for membership", href: "/apply" });
    links.push({
      label: "Check membership status",
      href: "/account/membership-status",
    });
  }

  if (context.intents?.includes("profile")) {
    preferredSectionIds.add("account-profile");
    links.push({ label: "Open account profile", href: "/account/profile" });
    links.push({ label: "Account dashboard", href: "/account" });
  }

  if (context.intents?.includes("auth")) {
    preferredSectionIds.add("auth");
    links.push({ label: "Login", href: "/login" });
    links.push({ label: "Create account", href: "/register" });
  }

  if (context.intents?.includes("notices")) {
    preferredSectionIds.add("notices");
    links.push({ label: "Open notices", href: "/notices" });
  }

  return {
    dynamicSummary: summary.slice(0, 2),
    additionalLinks: links.filter(
      (link, index, list) =>
        list.findIndex((item) => item.href === link.href) === index,
    ),
    preferredSectionIds: Array.from(preferredSectionIds),
  };
}

export async function resolveAiAssistantResponse(
  message: string,
  history: AiAssistantMessage[],
): Promise<AiAssistantResponse> {
  if (!message.trim()) {
    return emptyAiAssistantResponse;
  }

  const geminiConfigured = isGeminiConfigured();
  let geminiAttempted = false;
  let geminiSucceeded = false;
  let geminiError: string | null = null;
  let geminiModelUsed: string | undefined;
  let geminiModelsTried: string[] = [];

  const intents = detectIntents(message);
  const needsAbout = intents.some((intent) =>
    ["about", "contact", "membership", "profile", "auth"].includes(intent),
  );
  const needsCommittee = intents.includes("committee");
  const needsTestimonials = intents.includes("testimonials");

  const [aboutResult, committeeResult, testimonialsResult] =
    await Promise.allSettled([
      needsAbout ? getAiAboutSnapshot() : Promise.resolve(null),
      needsCommittee ? getAiCommitteeSnapshot() : Promise.resolve([]),
      needsTestimonials ? getAiTestimonialsSnapshot() : Promise.resolve([]),
    ]);

  const dynamicContext: AiAssistantDynamicContext = {
    intents,
    about: aboutResult.status === "fulfilled" ? aboutResult.value : null,
    committee:
      committeeResult.status === "fulfilled" ? committeeResult.value : [],
    testimonials:
      testimonialsResult.status === "fulfilled" ? testimonialsResult.value : [],
  };

  const localOptions = createDynamicSummary(dynamicContext);
  let baseResult: AiAssistantResponse = createLocalAssistantReply(
    message,
    history,
    localOptions,
  );

  const geminiResult = await generateGeminiAssistantReply(
    message,
    history,
    dynamicContext,
  );
  geminiAttempted = geminiResult.meta.attempted;
  geminiSucceeded = geminiResult.meta.succeeded;
  geminiError = geminiResult.meta.error;
  geminiModelUsed = geminiResult.meta.modelUsed;
  geminiModelsTried = geminiResult.meta.modelsTried;

  if (geminiResult.result?.answer) {
    baseResult = {
      ...geminiResult.result,
      relatedLinks:
        geminiResult.result.relatedLinks.length > 0
          ? geminiResult.result.relatedLinks
          : baseResult.relatedLinks,
    };
  }

  try {
    const events = await getAiEventCatalog();
    const recommendedEvents = createEventRecommendations(message, events);
    return {
      ...baseResult,
      recommendedEvents,
      providerStatus: {
        geminiConfigured,
        geminiAttempted,
        geminiSucceeded,
        geminiError,
        geminiModelUsed,
        geminiModelsTried,
      },
    };
  } catch {
    return {
      ...baseResult,
      providerStatus: {
        geminiConfigured,
        geminiAttempted,
        geminiSucceeded,
        geminiError,
        geminiModelUsed,
        geminiModelsTried,
      },
    };
  }
}
