import { PaymentStatus, PaymentVerificationStatus, RegistrationStatus } from "@/types/registration.types";

export function getRegistrationStatusLabel(status: RegistrationStatus) {
  switch (status) {
    case "REGISTERED":
      return "Registered";
    case "WAITLISTED":
      return "Waitlisted";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function getPaymentStatusLabel(status?: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Payment Pending";
    case "FAILED":
      return "Payment Failed";
    case "REFUNDED":
      return "Refunded";
    case "NOT_REQUIRED":
    case undefined:
      return null;
    default:
      return status;
  }
}

export function getPaymentVerificationStatusLabel(status?: PaymentVerificationStatus) {
  switch (status) {
    case "VERIFIED":
      return "Payment Verified";
    case "PENDING_VERIFICATION":
      return "Verification in Progress";
    case "FAILED":
      return "Verification Failed";
    case "NOT_APPLICABLE":
    case undefined:
      return null;
    default:
      return status;
  }
}


export type RegistrationFilter = "ALL" | "REGISTERED" | "WAITLISTED" | "PAID" | "FREE" | "PENDING_VERIFICATION";

export const registrationFilterOptions: Array<{ value: RegistrationFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "REGISTERED", label: "Registered" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "PAID", label: "Paid" },
  { value: "FREE", label: "Free" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
];

type RegistrationLike = {
  status: RegistrationStatus;
  paymentVerificationStatus?: PaymentVerificationStatus;
  event: {
    eventType?: "FREE" | "PAID";
  };
};

export function matchesRegistrationFilter(registration: RegistrationLike, filter: RegistrationFilter) {
  switch (filter) {
    case "REGISTERED":
      return registration.status === "REGISTERED";
    case "WAITLISTED":
      return registration.status === "WAITLISTED";
    case "PAID":
      return registration.event.eventType === "PAID";
    case "FREE":
      return (registration.event.eventType ?? "FREE") === "FREE";
    case "PENDING_VERIFICATION":
      return registration.paymentVerificationStatus === "PENDING_VERIFICATION";
    case "ALL":
    default:
      return true;
  }
}
