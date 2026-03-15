export type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";

export type RegistrationItem = {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    location: string;
    eventDate: string;
    capacity?: number;
  };
  member?: {
    id: string;
    membershipId?: string;
    user?: {
      id: string;
      name?: string | null;
      email: string;
    };
  };
};
