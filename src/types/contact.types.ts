export type ContactMessageStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
export type ContactMessageCategory = "GENERAL" | "MEMBERSHIP" | "EVENTS" | "PAYMENTS" | "PARTNERSHIP" | "TECHNICAL";

export const contactCategoryOptions: Array<{ value: ContactMessageCategory; label: string }> = [
  { value: "GENERAL", label: "General" },
  { value: "MEMBERSHIP", label: "Membership" },
  { value: "EVENTS", label: "Events" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "TECHNICAL", label: "Technical support" },
];

export const contactStatusOptions: Array<{ value: ContactMessageStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export const contactCategoryLabels: Record<ContactMessageCategory, string> = Object.fromEntries(contactCategoryOptions.map((option) => [option.value, option.label])) as Record<ContactMessageCategory, string>;
export const contactStatusLabels: Record<ContactMessageStatus, string> = Object.fromEntries(contactStatusOptions.map((option) => [option.value, option.label])) as Record<ContactMessageStatus, string>;

export type ContactMessageItem = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  subject: string;
  category: ContactMessageCategory;
  message: string;
  status: ContactMessageStatus;
  adminNote?: string | null;
  reviewedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name?: string | null; email: string; role?: string | null } | null;
  reviewer?: { id: string; name?: string | null; email: string } | null;
};

export type AdminContactMessagesResponse = {
  meta: { page: number; limit: number; total: number };
  summary: { total: number; pending: number; inProgress: number; resolved: number };
  result: ContactMessageItem[];
};

export type CreateContactMessagePayload = {
  category: ContactMessageCategory;
  phone?: string;
  subject: string;
  message: string;
};

export type ReviewContactMessagePayload = {
  status: ContactMessageStatus;
  adminNote?: string;
};
