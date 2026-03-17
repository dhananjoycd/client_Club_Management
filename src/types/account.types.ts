import { RegistrationItem } from "@/types/registration.types";

export type AccountProfile = {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  academicSession?: string | null;
  department?: string | null;
  studentId?: string | null;
  district?: string | null;
  role: string;
  profileComplete: boolean;
  missingFields: string[];
  isClubMember: boolean;
  membershipFieldsLocked: boolean;
  latestApplicationStatus?: string | null;
  latestApplicationReason?: string | null;
  memberProfile?: {
    id: string;
    membershipId: string;
    studentId?: string | null;
    district?: string | null;
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
  studentId?: string;
  district?: string;
};
