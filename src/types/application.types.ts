export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MembershipApplicationPayload = {
  department: string;
  session: string;
  studentId: string;
  district: string;
  phone: string;
};

export type MembershipApplication = {
  id: string;
  userId: string;
  department: string;
  session: string;
  studentId: string;
  district: string;
  phone: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  applicant?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  };
  reviewer?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
};

export type ReviewApplicationPayload = {
  status: "APPROVED" | "REJECTED";
  reason?: string;
};
