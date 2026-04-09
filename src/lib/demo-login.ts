export type DemoLoginRole = "USER" | "MEMBER" | "EVENT_MANAGER" | "ADMIN";

export type DemoLoginCredential = {
  role: DemoLoginRole;
  label: string;
  email: string;
  password: string;
  description: string;
};

const demoRoleConfig: Array<{
  role: DemoLoginRole;
  label: string;
  description: string;
  email: string | undefined;
  password: string | undefined;
}> = [
  {
    role: "USER",
    label: "Demo User",
    description: "General user account with account and registration access.",
    email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD,
  },
  {
    role: "MEMBER",
    label: "Demo Member",
    description: "Member dashboard account with club member access.",
    email: process.env.NEXT_PUBLIC_DEMO_MEMBER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_MEMBER_PASSWORD,
  },
  {
    role: "EVENT_MANAGER",
    label: "Demo Event Manager",
    description: "Event management account for event and enrollment workflows.",
    email: process.env.NEXT_PUBLIC_DEMO_EVENT_MANAGER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_EVENT_MANAGER_PASSWORD,
  },
  {
    role: "ADMIN",
    label: "Demo Admin",
    description: "Admin dashboard account for reviewing and managing the platform.",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD,
  },
];

export function isDemoLoginEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";
}

export function getDemoLoginCredentials(): DemoLoginCredential[] {
  if (!isDemoLoginEnabled()) {
    return [];
  }

  return demoRoleConfig.flatMap((item) => {
    const email = item.email?.trim();
    const password = item.password?.trim();

    if (!email || !password) {
      return [];
    }

    return [{
      role: item.role,
      label: item.label,
      email,
      password,
      description: item.description,
    }];
  });
}
