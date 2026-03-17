"use client";

import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";

const guestSteps = [
  {
    title: "Sign in first",
    description: "The backend links each application to an authenticated user account before review starts.",
    icon: ShieldCheck,
  },
  {
    title: "Submit academic details",
    description: "Provide your phone, session, department, and student ID accurately in your profile.",
    icon: FileText,
  },
  {
    title: "Wait for review",
    description: "Your application moves into the admin review workflow after successful submission.",
    icon: CheckCircle2,
  },
];

const signedInSteps = [
  {
    title: "Account verified",
    description: "Your signed-in account will be attached to the membership request automatically.",
    icon: ShieldCheck,
  },
  {
    title: "Submit academic details",
    description: "Provide your phone, session, department, and student ID accurately in your profile.",
    icon: FileText,
  },
  {
    title: "Wait for review",
    description: "Your application moves into the admin review workflow after successful submission.",
    icon: CheckCircle2,
  },
];

export function ApplicationProcessSteps() {
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  const steps = sessionQuery.data?.data?.user ? signedInSteps : guestSteps;

  return (
    <div className="grid gap-4">
      {steps.map((step) => {
        const Icon = step.icon;

        return (
          <div key={step.title} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
            <div className="inline-flex rounded-2xl bg-white p-3 text-[var(--color-primary)] shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-primary)]">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{step.description}</p>
          </div>
        );
      })}
    </div>
  );
}
