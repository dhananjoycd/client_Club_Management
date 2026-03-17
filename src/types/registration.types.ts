export type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";
export type PaymentStatus = "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentVerificationStatus = "NOT_APPLICABLE" | "PENDING_VERIFICATION" | "VERIFIED" | "FAILED";

export type RegistrationItem = {
  id: string;
  status: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  paymentVerificationStatus?: PaymentVerificationStatus;
  snapshotName?: string;
  snapshotEmail?: string;
  snapshotPhone?: string;
  snapshotSession?: string;
  snapshotDepartment?: string;
  paidAmount?: number | null;
  paidCurrency?: string | null;
  stripeCheckoutSessionId?: string | null;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    location: string;
    eventDate: string;
    capacity?: number;
    eventType?: "FREE" | "PAID";
    price?: number | null;
    currency?: string | null;
  };
  user?: {
    id: string;
    name?: string | null;
    email: string;
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
