export type TestimonialStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PublicTestimonial = {
  id: string;
  authorName: string;
  quote: string;
  meta: string;
  isFeatured: boolean;
  createdAt: string;
  reviewedAt?: string | null;
};

export type MyTestimonial = {
  id: string;
  authorName: string;
  quote: string;
  meta: string;
  status: TestimonialStatus;
  reviewReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
};

export type AdminTestimonial = MyTestimonial & {
  user: { id: string; name?: string | null; email: string };
  reviewer?: { id: string; name?: string | null; email: string } | null;
  isFeatured: boolean;
  displayOrder: number;
};

export type AdminTestimonialsResponse = {
  meta: { page: number; limit: number; total: number };
  summary: { pending: number; approved: number; rejected: number; total: number };
  result: AdminTestimonial[];
};

export type CreateTestimonialPayload = {
  quote: string;
  meta: string;
};

export type ReviewTestimonialPayload = {
  status: "APPROVED" | "REJECTED";
  reviewReason?: string;
  isFeatured?: boolean;
  displayOrder?: number;
};
