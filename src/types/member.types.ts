export type MemberStatus = "ACTIVE" | "SUSPENDED";

export type MemberProfile = {
  id: string;
  userId: string;
  membershipId: string;
  joinDate: string;
  bio?: string | null;
  profilePhoto?: string | null;
  status: MemberStatus;
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  };
  registrations?: Array<{
    id: string;
    status: string;
    registeredAt: string;
    event: {
      id: string;
      title: string;
      location: string;
      eventDate: string;
    };
  }>;
};

export type UpdateMemberPayload = {
  bio?: string;
  profilePhoto?: string;
  status?: MemberStatus;
};
