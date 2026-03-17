export type DashboardAdminData = {
  totalMembers: number;
  pendingApplications: number;
  totalEvents: number;
  recentNotices: Array<{
    id: string;
    title: string;
    content: string;
    audience: string;
    createdAt: string;
    creator?: {
      id: string;
      name?: string | null;
      email: string;
    };
  }>;
};

export type DashboardMemberData = {
  profileStatus: string | null;
  profileComplete: boolean;
  upcomingEvents: Array<{
    id: string;
    title: string;
    location: string;
    eventDate: string;
    capacity: number;
  }>;
  registeredEvents: Array<{
    id: string;
    status: string;
    paymentStatus?: string;
    registeredAt: string;
    event: {
      id: string;
      title: string;
      location: string;
      eventDate: string;
      eventType?: "FREE" | "PAID";
      price?: number | null;
      currency?: string | null;
    };
  }>;
};
