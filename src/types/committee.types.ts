export type CommitteeDisplayMember = {
  id?: string;
  memberId?: string;
  memberProfileId?: string;
  name: string;
  role: string;
  department?: string | null;
  academicSession?: string | null;
  wing?: string | null;
  bio?: string;
  photoUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  email?: string;
  sortOrder?: number;
};

export type CommitteeSessionItem = {
  id: string;
  label: string;
  title?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
  assignments: CommitteeDisplayMember[];
};

export type PublicCommitteeResponse = {
  activeSession: CommitteeSessionItem | null;
  sessions: CommitteeSessionItem[];
};

export type EligibleCommitteeMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  academicSession?: string | null;
  membershipId: string;
  photoUrl?: string | null;
};

export type CreateCommitteeSessionPayload = {
  label: string;
  title?: string;
  description?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdateCommitteeSessionPayload = Partial<CreateCommitteeSessionPayload>;

export type CreateCommitteeAssignmentPayload = {
  sessionId: string;
  memberProfileId: string;
  committeeWing: string;
  positionTitle: string;
  sortOrder?: number;
  isActive?: boolean;
  bioOverride?: string;
  photoUrlOverride?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  whatsapp?: string;
};

export type UpdateCommitteeAssignmentPayload = Partial<Omit<CreateCommitteeAssignmentPayload, "sessionId" | "memberProfileId">>;
