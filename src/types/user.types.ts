import { ApiListMeta } from "@/types/api.types";
import { ApplicationStatus } from "@/types/application.types";
import { MemberStatus } from "@/types/member.types";

export type UserRole = "USER" | "MEMBER" | "ADMIN" | "SUPER_ADMIN" | "EVENT_MANAGER";
export type UserApplicationFilter = ApplicationStatus | "NONE";
export type UserMembershipFilter = MemberStatus | "NONE";

export type UserListItem = {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  academicSession?: string | null;
  department?: string | null;
  studentId?: string | null;
  district?: string | null;
  role: UserRole;
  createdAt: string;
  profileComplete: boolean;
  registrationsCount: number;
  latestApplication: {
    id: string;
    status: ApplicationStatus;
    submittedAt: string;
    reviewedAt?: string | null;
    reviewReason?: string | null;
  } | null;
  memberProfile: {
    id: string;
    membershipId: string;
    status: MemberStatus;
    joinDate: string;
  } | null;
};

export type UsersSummary = {
  totalUsers: number;
  totalMembers: number;
  pendingApplicants: number;
  admins: number;
};

export type UserListResponse = {
  meta: ApiListMeta;
  summary: UsersSummary;
  result: UserListItem[];
};

export type UserDetails = {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  academicSession?: string | null;
  department?: string | null;
  studentId?: string | null;
  district?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profileComplete: boolean;
  registrationsCount: number;
  memberProfile: {
    id: string;
    membershipId: string;
    status: MemberStatus;
    joinDate: string;
    bio?: string | null;
    profilePhoto?: string | null;
  } | null;
  applications: Array<{
    id: string;
    department: string;
    session: string;
    studentId: string;
    district: string;
    phone: string;
    status: ApplicationStatus;
    submittedAt: string;
    reviewedAt?: string | null;
    reviewReason?: string | null;
    reviewer?: {
      id: string;
      name?: string | null;
      email: string;
    } | null;
  }>;
  registrations: Array<{
    id: string;
    status: string;
    paymentStatus?: string | null;
    paymentVerificationStatus?: string | null;
    registeredAt: string;
    event: {
      id: string;
      title: string;
      location: string;
      eventDate: string;
      eventType?: string | null;
      price?: number | null;
    };
  }>;
};

export type UpdateUserRolePayload = {
  role: Extract<UserRole, "USER" | "MEMBER" | "ADMIN" | "EVENT_MANAGER">;
};
