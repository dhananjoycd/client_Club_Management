import { ApplicationForm } from "@/features/applications/components/application-form";
import { ApplicationProcessSteps } from "@/features/applications/components/application-process-steps";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";



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
            <ApplicationProcessSteps />
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
