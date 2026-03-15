import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";

const steps = [
  {
    title: "Sign in first",
    description: "The backend links each application to an authenticated user account before review starts.",
    icon: ShieldCheck,
  },
  {
    title: "Submit academic details",
    description: "Provide department, session, student ID, district, and phone number accurately.",
    icon: FileText,
  },
  {
    title: "Wait for review",
    description: "Your application moves into the admin review workflow after successful submission.",
    icon: CheckCircle2,
  },
];

export default function ApplyPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Membership Application"
          title="Apply to become a club member"
          description="This application flow is now aligned with the real backend contract. Identity comes from the authenticated account, while the form collects academic and contact details required for review."
        />

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <SectionWrapper
            title="Application process"
            description="Use this page to submit your membership request through the authenticated backend workflow."
          >
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
          </SectionWrapper>

          <SectionWrapper
            title="Application details"
            description="Complete the required application fields after signing in."
          >
            <ApplicationForm />
          </SectionWrapper>
        </section>
      </div>
    </main>
  );
}
