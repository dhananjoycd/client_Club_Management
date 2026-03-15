export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  applications: {
    all: ["applications"] as const,
    list: (scope: string) => ["applications", scope] as const,
  },
  events: {
    all: ["events"] as const,
    upcoming: ["events", "upcoming"] as const,
    admin: ["events", "admin"] as const,
  },
  notices: {
    all: ["notices"] as const,
    admin: ["notices", "admin"] as const,
  },
  dashboard: {
    admin: ["dashboard", "admin"] as const,
    member: ["dashboard", "member"] as const,
  },
  members: {
    all: ["members"] as const,
    me: ["members", "me"] as const,
  },
  registrations: {
    all: ["registrations"] as const,
  },
  settings: {
    detail: ["settings"] as const,
  },
};
