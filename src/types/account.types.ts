import { RegistrationItem } from "@/types/registration.types";

export type AccountProfile = {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  academicSession?: string | null;
  department?: string | null;
  role: string;
  profileComplete: boolean;
  missingFields: string[];
  isClubMember: boolean;
  memberProfile?: {
    id: string;
    membershipId: string;
    status: string;
    bio?: string | null;
    profilePhoto?: string | null;
  } | null;
  registrations: RegistrationItem[];
};

export type UpdateAccountProfilePayload = {
  name?: string;
  phone?: string;
  academicSession?: string;
  department?: string;
  bio?: string;
  profilePhoto?: string;
};
