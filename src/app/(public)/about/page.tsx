import { BookOpenText, Building2, Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";

const pillars = [
  {
    title: "Identity",
    description: "A district association platform that helps students connect through culture, community, and academic collaboration.",
    icon: Building2,
  },
  {
    title: "Mission",
    description: "Create an organized space where members can participate in events, receive notices, and stay connected to the association.",
    icon: Handshake,
  },
  {
    title: "Values",
    description: "Professionalism, inclusion, service, and reliable communication shape how the platform and organization operate.",
    icon: BookOpenText,
  },
];

export default function AboutPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="About the Organization"
          title="Built to present the association with clarity, trust, and structure."
          description="This public frontend introduces the organization, explains its purpose, and gives prospective members a reliable first impression before they apply or sign in."
        />

        <SectionWrapper
          title="Who this platform serves"
          description="The system is designed to support public visitors, student applicants, registered members, and administrative teams through one coherent interface."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <div key={pillar.title} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                  <div className="inline-flex rounded-2xl bg-white p-3 text-[var(--color-primary)] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--color-primary)]">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </SectionWrapper>

        <SectionWrapper
          title="Why the system matters"
          description="The frontend is intentionally structured to make public communication easier while preparing for member and admin workflows in later phases."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5">
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">For visitors and applicants</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                Visitors can understand the organization quickly, review events and notices, and reach the application flow without confusion.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5">
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">For members and administrators</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                The same system later supports profile access, status review, application management, settings, and operational updates.
              </p>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </main>
  );
}
